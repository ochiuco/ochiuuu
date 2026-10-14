// lib/member-rewards.ts
import { Order } from '@prisma/client';
import { checkAndUpgradeMembership } from '@/lib/membership';

type TxClient = Omit<
  import('@prisma/client').PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

const PAID_STATUSES = ['paid', 'processing', 'shipped', 'in_transit', 'delivered', 'completed', 'ready_for_pickup'];

/** 積分規則：每消費 HK$1 = 1 積分（基於訂單 subtotal，不含運費） */
export function calculatePointsEarned(subtotalCents: number): number {
  return Math.floor(subtotalCents / 100);
}

/** 依 order.userId 或 email（不分大小寫）查找關聯用戶 */
export async function resolveOrderUser(
  tx: TxClient,
  order: Pick<Order, 'userId' | 'email'>
) {
  if (order.userId) {
    const byId = await tx.user.findUnique({ where: { id: order.userId } });
    if (byId) return byId;
  }

  if (!order.email) return null;

  return tx.user.findFirst({
    where: { email: { equals: order.email.trim(), mode: 'insensitive' } },
  });
}

/** 為已支付訂單發放積分並檢查會員晉升（冪等：已有積分記錄則跳過） */
export async function applyUserRewardsForOrder(
  tx: TxClient,
  order: Pick<Order, 'id' | 'orderNumber' | 'userId' | 'email' | 'subtotal' | 'status'>
): Promise<{ applied: boolean; pointsEarned: number; upgraded: boolean }> {
  if (!PAID_STATUSES.includes(order.status)) {
    return { applied: false, pointsEarned: 0, upgraded: false };
  }

  const user = await resolveOrderUser(tx, order);
  if (!user) {
    return { applied: false, pointsEarned: 0, upgraded: false };
  }

  const existing = await tx.pointsHistory.findFirst({
    where: { orderId: order.id },
  });
  if (existing) {
    return { applied: false, pointsEarned: 0, upgraded: user.isMember };
  }

  const pointsEarned = calculatePointsEarned(order.subtotal);
  if (pointsEarned > 0) {
    await tx.user.update({
      where: { id: user.id },
      data: { points: { increment: pointsEarned } },
    });
    await tx.pointsHistory.create({
      data: {
        userId: user.id,
        points: pointsEarned,
        reason: `訂單消費獎勵 (${order.orderNumber})`,
        orderId: order.id,
      },
    });
  }

  const wasMember = user.isMember;
  const upgraded = await checkAndUpgradeMembership(tx, user.id, order.subtotal);

  return { applied: true, pointsEarned, upgraded: upgraded || wasMember };
}
