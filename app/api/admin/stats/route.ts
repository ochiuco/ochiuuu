// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  // ========== Admin 路由守衛 ==========
  const adminPayload = await authenticateAdmin(request);
  if (!adminPayload) {
    return NextResponse.json(
      { error: '未授權訪問。請先登入管理後台。' },
      { status: 401 }
    );
  }
  // =====================================

  try {
    const [
      products,
      totalOrders,
      paidOrders,
      revenueResult,
      productSales,
      totalMembers,
      totalUsers,
    ] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          category: true,
          price: true,
          soldCount: true,
          stock: true,
          createdAt: true,
        },
        orderBy: { soldCount: 'desc' },
      }),
      prisma.order.count(),
      prisma.order.count({
        where: { status: { not: 'pending_payment' } },
      }),
      prisma.order.aggregate({
        where: { status: { not: 'pending_payment' } },
        _sum: { totalAmount: true },
      }),
      prisma.orderItem.groupBy({
        by: ['productId', 'name'],
        _sum: {
          quantity: true,
          price: true,
        },
        orderBy: {
          _sum: {
            quantity: 'desc',
          },
        },
      }),
      prisma.user.count({ where: { isMember: true } }),
      prisma.user.count(),
    ]);

    const totalRevenue = revenueResult._sum.totalAmount || 0;

    // 計算各商品收入
    const productStats = productSales.map((item) => ({
      productId: item.productId,
      name: item.name,
      totalQuantity: item._sum.quantity || 0,
      totalRevenue: (item._sum.price || 0) * (item._sum.quantity || 0),
    }));

    // 各分類銷量
    const categorySales: Record<string, number> = {};
    for (const p of products) {
      categorySales[p.category] = (categorySales[p.category] || 0) + p.soldCount;
    }

    // 計算總庫存
    let totalStock = 0;
    for (const p of products) {
      const stock = p.stock as Record<string, number>;
      totalStock += Object.values(stock).reduce((sum, v) => sum + v, 0);
    }

    // 會員統計（已在上方並行查詢）

    return NextResponse.json({
      overview: {
        totalOrders,
        paidOrders,
        totalRevenue,
        totalProducts: products.length,
        totalStock,
        totalMembers,
        totalUsers,
      },
      products: products.map((p) => {
        const stock = p.stock as Record<string, number>;
        const stockTotal = Object.values(stock).reduce((sum, v) => sum + v, 0);
        return {
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          soldCount: p.soldCount,
          stockTotal,
        };
      }),
      productSales: productStats,
      categorySales,
    });
  } catch (error) {
    console.error('獲取統計失敗：', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}