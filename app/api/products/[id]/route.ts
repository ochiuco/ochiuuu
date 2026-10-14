// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id, isActive: true },
  });

  if (!product) {
    return NextResponse.json(
      { error: '商品不存在' },
      { status: 404 }
    );
  }

  const formatted = {
    ...product,
    // 显式确保 hemService 字段以布尔值形式传递给前端，避免类型歧义
    hemService: Boolean(product.hemService),
    priceDisplay: `HK$ ${(product.price / 100).toFixed(0)}`,
    originalPriceDisplay: product.originalPrice
      ? `HK$ ${(product.originalPrice / 100).toFixed(0)}`
      : null,
  };

  return NextResponse.json({ product: formatted });
}