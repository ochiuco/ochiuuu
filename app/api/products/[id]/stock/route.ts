// app/api/products/[id]/stock/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const color = searchParams.get('color');
  const size = searchParams.get('size');

  const product = await prisma.product.findUnique({
    where: { id },
    select: { stock: true },
  });

  if (!product) {
    return NextResponse.json({ error: '商品不存在' }, { status: 404 });
  }

  const stock = product.stock as Record<string, number>;

  if (color && size) {
    const key = `${color}-${size}`;
    return NextResponse.json({ inStock: (stock[key] || 0) > 0, quantity: stock[key] || 0 });
  }

  return NextResponse.json({ stock });
}