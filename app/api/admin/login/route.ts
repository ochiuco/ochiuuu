// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminPassword, generateAdminToken } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: '請填寫帳號和密碼' }, { status: 400 });
    }

    // 查找管理員（支持 username 或 email 登入）
    const admin = await prisma.admin.findFirst({
      where: {
        OR: [
          { username: username.trim() },
          { email: username.trim().toLowerCase() },
        ],
      },
    });

    if (!admin) {
      // 防撞庫：不透露是帳號不存在還是密碼錯誤
      return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });
    }

    // 使用 bcrypt 驗證密碼
    const valid = await verifyAdminPassword(password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: '帳號或密碼錯誤' }, { status: 401 });
    }

    // 生成 JWT Token
    const token = generateAdminToken(admin.id, admin.username);

    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('Admin 登入失敗：', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}