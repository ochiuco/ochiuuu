// app/api/categories/counts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 返回每個分類下的活躍商品數量
 * 用於首頁 CategoryGrid 動態展示
 */
export async function GET(request: NextRequest) {
  try {
    const categoryCounts = await prisma.product.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: { _all: true },
    });

    // 轉換為 { category_slug: count } 格式
    const counts: Record<string, number> = {};
    for (const item of categoryCounts) {
      counts[item.category] = item._count._all;
    }

    return NextResponse.json({ counts });
  } catch (error) {
    console.error('獲取分類數量失敗：', error);
    return NextResponse.json({ counts: {} });
  }
}