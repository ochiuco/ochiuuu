// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

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
      // 為了安全，即使用戶不存在也返回成功（防止郵箱枚舉攻擊）
      return NextResponse.json({
        success: true,
        message: '如果該郵箱已註冊，驗證碼已發送。',
      });
    }

    if (!user.passwordHash) {
      return NextResponse.json({ error: '此帳戶尚未設定密碼，請先註冊' }, { status: 400 });
    }

    // 生成 6 位重置驗證碼
    const resetToken = generateOTP();
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 分鐘

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiry: resetExpiry,
      },
    });

    // 發送重置密碼郵件
    await sendPasswordResetEmail({
      email,
      token: resetToken,
      name: user.name || undefined,
    });

    return NextResponse.json({
      success: true,
      message: '重置密碼驗證碼已發送至您的郵箱。',
    });
  } catch (error) {
    console.error('忘記密碼處理失敗：', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}