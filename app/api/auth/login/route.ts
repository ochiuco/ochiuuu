// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: '請填寫電子郵箱和密碼' }, { status: 400 });
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
      return NextResponse.json({ error: '帳戶不存在，請先註冊' }, { status: 404 });
    }

    if (!user.passwordHash) {
      return NextResponse.json({ error: '此帳戶尚未設定密碼，請先註冊' }, { status: 400 });
    }

    const valid = verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: '密碼錯誤' }, { status: 401 });
    }

    // 檢查郵箱是否已驗證
    if (!user.isVerified) {
      return NextResponse.json(
        {
          error: '郵箱尚未驗證，請先完成郵箱驗證',
          requiresVerification: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
      isMember: user.isMember,
    });
  } catch (error) {
    console.error('登入失敗：', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}