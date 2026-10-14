// app/api/admin/members/sync-rewards/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateAdmin } from '@/lib/admin-auth';
import { applyUserRewardsForOrder } from '@/lib/member-rewards';

const PAID_STATUSES = ['paid', 'processing', 'shipped', 'in_transit', 'delivered', 'completed', 'ready_for_pickup'];

/** 補發歷史訂單的積分與會員晉升（冪等，可重複執行） */
export async function POST(request: NextRequest) {
  const adminPayload = await authenticateAdmin(request);
  if (!adminPayload) {
    return NextResponse.json({ error: '未授權訪問' }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { status: { in: PAID_STATUSES } },
      select: {
        id: true,
        orderNumber: true,
        userId: true,
        email: true,
        subtotal: true,
        status: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    let processed = 0;
    let pointsAwarded = 0;
    let membersUpgraded = 0;

    for (const order of orders) {
      const result = await prisma.$transaction(async (tx) =>
        applyUserRewardsForOrder(tx, order)
      );
      if (result.applied) {
        processed += 1;
        pointsAwarded += result.pointsEarned;
        if (result.upgraded) membersUpgraded += 1;
      }
    }

    const totalMembers = await prisma.user.count({ where: { isMember: true } });

    return NextResponse.json({
      success: true,
      processed,
      pointsAwarded,
      membersUpgraded,
      totalMembers,
      message: processed > 0
        ? `已補發 ${processed} 筆訂單的積分/會員狀態`
        : '所有已付款訂單的積分均已同步，無需補發',
    });
  } catch (error) {
    console.error('同步會員積分失敗：', error);
    return NextResponse.json({ error: '同步失敗' }, { status: 500 });
  }
}
