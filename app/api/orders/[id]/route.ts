// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      timeline: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
  }

  return NextResponse.json({ order });
}