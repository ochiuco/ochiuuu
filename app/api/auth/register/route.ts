// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: '請填寫電子郵箱和密碼' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '密碼長度至少 6 位' }, { status: 400 });
    }

    // 檢查是否已存在且已設定密碼
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.passwordHash) {
      return NextResponse.json({ error: '該郵箱已註冊，請直接登入' }, { status: 409 });
    }

    const passwordHash = hashPassword(password);

    // 生成 6 位驗證碼
    const verificationToken = generateOTP();
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 分鐘過期

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash,
        verificationToken,
        verificationExpiry,
        isVerified: false,
        ...(name && { name }),
      },
      create: {
        email,
        passwordHash,
        name: name || '',
        memberTier: 'BRONZE',
        points: 0,
        isVerified: false,
        verificationToken,
        verificationExpiry,
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

    // 發送驗證郵件
    await sendVerificationEmail({
      email,
      token: verificationToken,
      name: name || undefined,
    });

    return NextResponse.json({
      success: true,
      user,
      message: '註冊成功！驗證碼已發送至您的郵箱，請在 15 分鐘內完成驗證。',
      requiresVerification: true,
    });
  } catch (error) {
    console.error('註冊失敗：', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}