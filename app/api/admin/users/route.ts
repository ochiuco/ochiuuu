// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const admin = await authenticateAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.trim();

  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      points: true,
      isMember: true,
      isVerified: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    take: 100,
  });

  return NextResponse.json({ users });
}

export async function PATCH(request: NextRequest) {
  const admin = await authenticateAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  try {
    const { userId, isMember, pointsAdjust, pointsReason } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: '缺少 userId' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    if (typeof isMember === 'boolean') {
      await prisma.user.update({
        where: { id: userId },
        data: { isMember },
      });
    }

    if (typeof pointsAdjust === 'number' && pointsAdjust !== 0) {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { points: { increment: pointsAdjust } },
        });
        await tx.pointsHistory.create({
          data: {
            userId,
            points: pointsAdjust,
            reason: pointsReason || '管理員手動調整',
          },
        });
      });
    }

    const updated = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        points: true,
        isMember: true,
        isVerified: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error('更新用戶失敗：', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}
