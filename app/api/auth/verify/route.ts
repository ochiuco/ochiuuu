// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, token } = await request.json();

    if (!email || !token) {
      return NextResponse.json({ error: '請提供郵箱和驗證碼' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: '帳戶不存在' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ success: true, message: '郵箱已驗證' });
    }

    if (!user.verificationToken || !user.verificationExpiry) {
      return NextResponse.json({ error: '尚未發送驗證碼，請重新註冊' }, { status: 400 });
    }

    // 檢查是否過期
    if (new Date() > user.verificationExpiry) {
      return NextResponse.json({ error: '驗證碼已過期，請重新註冊' }, { status: 400 });
    }

    // 檢查驗證碼是否正確
    if (user.verificationToken !== token.trim()) {
      return NextResponse.json({ error: '驗證碼不正確' }, { status: 400 });
    }

    // 驗證通過，更新用戶
    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: '郵箱驗證成功！歡迎加入 O\'CHIU 會員。',
    });
  } catch (error) {
    console.error('驗證失敗：', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}