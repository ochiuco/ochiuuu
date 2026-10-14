// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, token, newPassword } = await request.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: '請提供完整資料' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: '密碼長度至少 6 位' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: '帳戶不存在' }, { status: 404 });
    }

    // 驗證 token
    if (!user.resetPasswordToken || !user.resetPasswordExpiry) {
      return NextResponse.json({ error: '尚未申請重置密碼，請重新操作' }, { status: 400 });
    }

    if (new Date() > user.resetPasswordExpiry) {
      return NextResponse.json({ error: '驗證碼已過期，請重新發送' }, { status: 400 });
    }

    if (user.resetPasswordToken !== token.trim()) {
      return NextResponse.json({ error: '驗證碼不正確' }, { status: 400 });
    }

    // 重置密碼（Hash 加密後存入）
    const passwordHash = hashPassword(newPassword);

    await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: '密碼重置成功！請使用新密碼登入。',
    });
  } catch (error) {
    console.error('重置密碼失敗：', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}