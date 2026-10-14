// lib/membership.ts

import { PrismaClient } from '@prisma/client';
import { MEMBER_THRESHOLD_SINGLE_ORDER, MEMBER_THRESHOLD_CUMULATIVE } from '@/lib/pricing';

/**
 * 會員晉升雙軌制觸發器（二元制：普通用戶 → 永久會員）
 * 
 * 在訂單支付成功後調用。檢查：
 * - 條件 A：當前訂單 subtotal（不含運費） >= 800 HKD (80000 分)
 * - 條件 B：用戶所有已支付/已完成訂單的 subtotal 累計 >= 1500 HKD (150000 分)
 * 
 * 滿足任一條件即自動升級為永久會員 (isMember: true)
 * 
 * @param tx - Prisma 事務客戶端
 * @param userId - 用戶 ID
 * @param currentOrderSubtotal - 當前訂單的 subtotal（分，不含運費）
 */
export async function checkAndUpgradeMembership(
  tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
  userId: string,
  currentOrderSubtotal: number
): Promise<boolean> {
  const user = await (tx as any).user.findUnique({
    where: { id: userId },
    select: { isMember: true },
  });

  if (!user) return false;

  if (user.isMember) return true;

  let shouldUpgrade = false;

  // 條件 A：單筆觸發
  if (currentOrderSubtotal >= MEMBER_THRESHOLD_SINGLE_ORDER) {
    shouldUpgrade = true;
  }

  // 條件 B：累計觸發
  if (!shouldUpgrade) {
    const result = await (tx as any).order.aggregate({
      where: {
        userId,
        status: { in: ['paid', 'processing', 'shipped', 'in_transit', 'delivered', 'completed'] },
      },
      _sum: { subtotal: true },
    });

    const cumulativeSubtotal = result._sum.subtotal || 0;
    if (cumulativeSubtotal >= MEMBER_THRESHOLD_CUMULATIVE) {
      shouldUpgrade = true;
    }
  }

  // 執行晉升
  if (shouldUpgrade) {
    await (tx as any).user.update({
      where: { id: userId },
      data: { isMember: true },
    });

    console.log(`🎉 用戶 ${userId} 已晉升為永久會員`);
    return true;
  }

  return false;
}