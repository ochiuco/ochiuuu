// app/api/account/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 查詢用戶帳戶
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: '請提供 email' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      pointsHistory: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          status: true,
          totalAmount: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: '帳戶不存在' }, { status: 404 });
  }

  return NextResponse.json({ user });
}

// POST: 創建或更新帳戶
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, phone } = body;

    if (!email) {
      return NextResponse.json({ error: '請提供 email' }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        ...(name && { name }),
        ...(phone && { phone }),
      },
      create: {
        email,
        name: name || '',
        phone: phone || '',
        points: 0,
      },
      include: {
        pointsHistory: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('帳戶操作失敗：', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}