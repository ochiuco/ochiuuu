// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// "新品" 相關搜索關鍵詞，命中時映射到 tag='NEW' 的商品
const NEW_ARRIVAL_KEYWORDS = ['新品', '最新', '新款', '新到', 'new', 'new arrival'];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort') || 'newest';
  const featured = searchParams.get('featured');
  const isNew = searchParams.get('isNew');

  // 構建查詢條件
  const where: any = { isActive: true };

  if (category && category !== 'all') {
    where.category = category;
  }

  // 「新品上市」= tag='NEW' 或 isNew=true
  if (tag === 'new') {
    where.OR = [{ tag: 'NEW' }, { isNew: true }];
  } else if (tag === 'limited') {
    where.tag = 'LIMITED';
  }

  // 特色商品：isBestSeller=true 或 isNew=true 均出現在 POPULAR ITEMS
  if (featured === 'true') {
    where.OR = [{ isBestSeller: true }, { isNew: true }];
  }

  // 最新商品：isNew=true（單獨篩選用）
  if (isNew === 'true') {
    where.isNew = true;
  }

  // 排序
  let orderBy: any = { createdAt: 'desc' };
  switch (sort) {
    case 'price-asc':
      orderBy = { price: 'asc' };
      break;
    case 'price-desc':
      orderBy = { price: 'desc' };
      break;
    case 'popular':
      orderBy = { soldCount: 'desc' };
      break;
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  // 搜索邏輯
  if (search) {
    const searchTrimmed = search.trim().toLowerCase();

    // 關鍵詞攔截：如果搜索詞是「新品」相關詞彙，直接篩選 tag='NEW'
    const isNewArrivalKeyword = NEW_ARRIVAL_KEYWORDS.some(
      (keyword) => searchTrimmed.includes(keyword)
    );

    if (isNewArrivalKeyword) {
      where.tag = 'NEW';
      // 不加其他模糊搜索條件，直接返回你標記為新品的商品
    } else {
      // 模糊匹配：同時匹配 name、description、tag、tags、category、material
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tag: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
        { material: { contains: search, mode: 'insensitive' } },
      ];
    }
  }

  const products = await prisma.product.findMany({
    where,
    orderBy,
    select: {
      id: true,
      name: true,
      price: true,
      originalPrice: true,
      category: true,
      tag: true,
      tags: true,
      images: true,
      hoverImage: true,
      colors: true,
      sizes: true,
      stock: true,
      isBestSeller: true,
      isNew: true,
      createdAt: true,
    },
  });

  // 格式化價格
  const formatted = products.map((p) => ({
    ...p,
    priceDisplay: `HK$ ${(p.price / 100).toFixed(0)}`,
    originalPriceDisplay: p.originalPrice ? `HK$ ${(p.originalPrice / 100).toFixed(0)}` : null,
  }));

  return NextResponse.json({ products: formatted });
}