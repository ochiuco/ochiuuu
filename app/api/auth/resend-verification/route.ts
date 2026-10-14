// app/api/auth/resend-verification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: '請提供電子郵箱' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: '帳戶不存在' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ error: '帳戶已驗證，無需重複操作' }, { status: 400 });
    }

    // 生成新驗證碼
    const verificationToken = generateOTP();
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        verificationToken,
        verificationExpiry,
      },
    });

    await sendVerificationEmail({
      email,
      token: verificationToken,
      name: user.name || undefined,
    });

    return NextResponse.json({
      success: true,
      message: '新的驗證碼已發送至您的郵箱。',
    });
  } catch (error) {
    console.error('重新發送驗證碼失敗：', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}