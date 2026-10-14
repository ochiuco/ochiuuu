// app/api/wishlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: 獲取用戶收藏列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: '缺少 email 參數' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            originalPrice: true,
            images: true,
            hoverImage: true,
            tag: true,
            colors: true,
            sizes: true,
            category: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(wishlist);
  } catch (error) {
    console.error('獲取收藏列表失敗:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}

// POST: 添加收藏
export async function POST(request: NextRequest) {
  try {
    const { email, productId } = await request.json();

    if (!email || !productId) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: '商品不存在' }, { status: 404 });
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: '已在收藏中' }, { status: 200 });
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: user.id,
        productId: productId,
      },
    });

    return NextResponse.json(wishlistItem, { status: 201 });
  } catch (error) {
    console.error('添加收藏失敗:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}

// DELETE: 取消收藏
export async function DELETE(request: NextRequest) {
  try {
    const { email, productId } = await request.json();

    if (!email || !productId) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    await prisma.wishlist.deleteMany({
      where: {
        userId: user.id,
        productId: productId,
      },
    });

    return NextResponse.json({ message: '已取消收藏' });
  } catch (error) {
    console.error('取消收藏失敗:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}