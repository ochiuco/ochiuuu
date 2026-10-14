// lib/admin-auth.ts

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'ochiu-admin-secret-fallback-2026';
const JWT_EXPIRES_IN = '24h';

/**
 * 使用 bcrypt 對管理員密碼進行 Hash 加密
 */
export async function hashAdminPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 驗證管理員密碼
 */
export async function verifyAdminPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * 為管理員生成 JWT Token
 */
export function generateAdminToken(adminId: string, username: string): string {
  return jwt.sign(
    { adminId, username, role: 'admin' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * 驗證 JWT Token
 */
export function verifyAdminToken(token: string): { adminId: string; username: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      adminId: string;
      username: string;
      role: string;
    };
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Admin 路由守衛中間件
 * 
 * 從請求 Headers 中提取 Bearer Token 並驗證。
 * 返回 null 表示驗證失敗（應返回 401/403），返回 decoded payload 表示通過。
 */
export async function authenticateAdmin(request: NextRequest): Promise<{
  adminId: string;
  username: string;
} | null> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7); // 去掉 "Bearer " 前綴
  const decoded = verifyAdminToken(token);

  if (!decoded) {
    return null;
  }

  // 二次驗證：確認 Admin 仍存在於數據庫
  const admin = await prisma.admin.findUnique({
    where: { id: decoded.adminId },
  });

  if (!admin) {
    return null;
  }

  return { adminId: decoded.adminId, username: decoded.username };
}