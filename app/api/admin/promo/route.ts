// app/api/admin/promo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  const admin = await authenticateAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const codes = await prisma.promoCode.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    promoCodes: codes.map((p) => ({
      ...p,
      discountValueDisplay:
        p.discountType === 'PERCENTAGE'
          ? `${p.discountValue}%`
          : `HK$ ${(p.discountValue / 100).toFixed(0)}`,
      minOrderAmountHkd: p.minOrderAmount ? p.minOrderAmount / 100 : null,
    })),
  });
}

export async function POST(request: NextRequest) {
  const admin = await authenticateAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const code = String(body.code || '').trim().toUpperCase();
    const discountType = body.discountType === 'FIXED' ? 'FIXED' : 'PERCENTAGE';

    if (!code) return NextResponse.json({ error: '請填寫優惠碼' }, { status: 400 });

    let discountValue: number;
    if (discountType === 'PERCENTAGE') {
      discountValue = Math.round(Number(body.discountPercent ?? body.discountValue));
      if (Number.isNaN(discountValue) || discountValue <= 0 || discountValue > 100) {
        return NextResponse.json({ error: '折扣百分比須為 1–100' }, { status: 400 });
      }
    } else {
      discountValue = Math.round(Number(body.discountAmountHkd ?? body.discountValue) * 100);
      if (Number.isNaN(discountValue) || discountValue <= 0) {
        return NextResponse.json({ error: '固定折扣金額無效' }, { status: 400 });
      }
    }

    const minOrderAmount =
      body.minOrderAmountHkd !== undefined && body.minOrderAmountHkd !== '' && body.minOrderAmountHkd !== null
        ? Math.round(Number(body.minOrderAmountHkd) * 100)
        : null;

    const maxUses =
      body.maxUses !== undefined && body.maxUses !== '' && body.maxUses !== null
        ? Math.max(1, Math.floor(Number(body.maxUses)))
        : null;

    const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

    const created = await prisma.promoCode.create({
      data: {
        code,
        discountType,
        discountValue,
        minOrderAmount,
        maxUses,
        expiresAt,
        isActive: body.isActive !== false,
      },
    });

    return NextResponse.json({ promoCode: created });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: '此優惠碼已存在' }, { status: 400 });
    }
    console.error('創建優惠碼失敗：', error);
    return NextResponse.json({ error: '創建失敗' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await authenticateAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 });

    const data: Record<string, unknown> = {};

    if (typeof body.isActive === 'boolean') data.isActive = body.isActive;

    if (body.discountType === 'PERCENTAGE' || body.discountType === 'FIXED') {
      data.discountType = body.discountType;
    }

    if (body.discountPercent !== undefined && body.discountType !== 'FIXED') {
      data.discountValue = Math.round(Number(body.discountPercent));
    }
    if (body.discountAmountHkd !== undefined && body.discountType === 'FIXED') {
      data.discountValue = Math.round(Number(body.discountAmountHkd) * 100);
    }

    if (body.minOrderAmountHkd !== undefined) {
      data.minOrderAmount =
        body.minOrderAmountHkd === '' || body.minOrderAmountHkd === null
          ? null
          : Math.round(Number(body.minOrderAmountHkd) * 100);
    }

    if (body.maxUses !== undefined) {
      data.maxUses =
        body.maxUses === '' || body.maxUses === null
          ? null
          : Math.max(1, Math.floor(Number(body.maxUses)));
    }

    if (body.expiresAt !== undefined) {
      data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    }

    const updated = await prisma.promoCode.update({
      where: { id },
      data,
    });

    return NextResponse.json({ promoCode: updated });
  } catch (error) {
    console.error('更新優惠碼失敗：', error);
    return NextResponse.json({ error: '更新失敗' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await authenticateAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 });

  try {
    await prisma.promoCode.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('刪除優惠碼失敗：', error);
    return NextResponse.json({ error: '刪除失敗（可能已有訂單使用）' }, { status: 500 });
  }
}
