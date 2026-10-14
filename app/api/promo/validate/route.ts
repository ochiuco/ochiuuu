// app/api/promo/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findBuiltInPromoCode, calculateBuiltInPromoDiscountHKD } from '@/lib/pricing';

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal, email } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: '請輸入優惠碼' }, { status: 400 });
    }

    if (subtotal === undefined || subtotal === null) {
      return NextResponse.json({ error: '缺少訂單金額' }, { status: 400 });
    }

    // ========== 優先檢查內建優惠碼（無門檻，直接計算） ==========
    // 注意：此處 subtotal 應為原始商品小計（港幣），絕非折後金額
    const builtIn = findBuiltInPromoCode(code);
    if (builtIn) {
      const discountAmount = calculateBuiltInPromoDiscountHKD(subtotal, builtIn);
      return NextResponse.json({
        valid: true,
        discountType: builtIn.discountType,
        discountValue: builtIn.discountValue,
        discountAmount,
        label: builtIn.label,
      });
    }
    // ============================================================

    // ========== 內建碼未命中，走數據庫查詢 ==========
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!promoCode) {
      return NextResponse.json({ error: '優惠碼不存在' }, { status: 404 });
    }

    if (!promoCode.isActive) {
      return NextResponse.json({ error: '該優惠碼已停用' }, { status: 400 });
    }

    // 檢查過期
    if (promoCode.expiresAt && new Date() > promoCode.expiresAt) {
      return NextResponse.json({ error: '該優惠碼已過期' }, { status: 400 });
    }

    // 檢查使用次數
    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      return NextResponse.json({ error: '該優惠碼已達使用上限' }, { status: 400 });
    }

    // 檢查最低消費（subtotal 為前端傳入的原始港幣金額，minOrderAmount 為分）
    const subtotalCents = Math.round(subtotal * 100);
    if (promoCode.minOrderAmount && subtotalCents < promoCode.minOrderAmount) {
      const minAmountDollars = (promoCode.minOrderAmount / 100).toFixed(0);
      return NextResponse.json(
        { error: `訂單金額需滿 HK$ ${minAmountDollars} 才可使用此優惠碼` },
        { status: 400 }
      );
    }

    // 計算折扣金額（基於原始 subtotal，返回港幣金額，非分）
    let discountAmount: number;
    if (promoCode.discountType === 'PERCENTAGE') {
      discountAmount = Math.floor((subtotal * promoCode.discountValue) / 100 * 100) / 100;
    } else {
      // FIXED: discountValue 存的是分
      discountAmount = promoCode.discountValue / 100;
    }

    // 確保折扣不超過小計
    discountAmount = Math.min(discountAmount, subtotal);

    return NextResponse.json({
      valid: true,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountType === 'PERCENTAGE'
        ? promoCode.discountValue
        : promoCode.discountValue / 100,
      discountAmount,
      label: promoCode.discountType === 'PERCENTAGE'
        ? `全單${100 - promoCode.discountValue}折優惠`
        : `減 HK$ ${(promoCode.discountValue / 100).toFixed(0)} 優惠`,
    });
  } catch (error) {
    console.error('驗證優惠碼失敗：', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}