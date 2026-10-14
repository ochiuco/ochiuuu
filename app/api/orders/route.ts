// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30; // 秒，對應 Neon 冷啟動 + 多次 DB 查詢
import { prisma } from '@/lib/prisma';
import { sendPaymentReceiptEmail } from '@/lib/email';
import { sendPaymentQRCodeViaWhatsApp } from '@/lib/whatsapp';
import {
  calculateMemberDiscountAmount,
  findBuiltInPromoCode,
  calculateBuiltInPromoDiscount,
  determineBestDiscount,
} from '@/lib/pricing';

// 生成訂單編號
function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `OC${date}${random}`;
}

// 計算階梯運費（單位：分）
function calculateShippingFee(shippingMethod: string, afterDiscountCents: number): number {
  if (shippingMethod === 'store_pickup') return 0;

  const threshold = 59900; // HK$ 599 = 59900 分

  if (afterDiscountCents >= threshold) {
    if (shippingMethod === 'sf_locker') return 0;
    if (shippingMethod === 'sf_delivery') return 1500; // HK$ 15
  } else {
    if (shippingMethod === 'sf_locker') return 2000; // HK$ 20
    if (shippingMethod === 'sf_delivery') return 3500; // HK$ 35
  }

  return 0;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      email,
      phone,
      shippingName,
      shippingAddress,
      shippingCity,
      shippingDistrict,
      shippingMethod,
      paymentMethod,
      promoCode,
      note,
    } = body;

    // 驗證必填字段
    if (!items || items.length === 0) {
      return NextResponse.json({ error: '購物車為空' }, { status: 400 });
    }
    if (!email || !phone || !shippingName || !shippingAddress || !shippingCity) {
      return NextResponse.json({ error: '請填寫完整配送資訊' }, { status: 400 });
    }

    // 驗證庫存並計算金額
    let subtotal = 0;
    const validatedItems: {
      productId: string;
      name: string;
      color: string;
      size: string;
      price: number;
      quantity: number;
      image: string;
      hemming: boolean;
      hemmingFee: number;
    }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `商品不存在：${item.productId}` },
          { status: 400 }
        );
      }

      // 檢查庫存
      const stockKey = `${item.color}-${item.size}`;
      const stock = (product.stock as Record<string, number>)[stockKey] || 0;

      if (stock < item.quantity) {
        return NextResponse.json(
          {
            error: `庫存不足：${product.name}（${item.color}/${item.size}）僅剩 ${stock} 件`,
          },
          { status: 400 }
        );
      }

      // 計算修褲腳費用
      const isBottoms = product.category === 'bottoms';
      const hemming = isBottoms && item.hemming === true;
      const hemmingFee = hemming ? 1500 : 0; // HK$ 15 = 1500 分

      subtotal += (product.price + hemmingFee) * item.quantity;
      validatedItems.push({
        productId: product.id,
        name: product.name,
        color: item.color,
        size: item.size,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || '',
        hemming,
        hemmingFee,
      });
    }

    // ========== 確認用戶身份 ==========
    let userIsMember = false;
    let userId: string | null = null;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      userId = existingUser.id;
      userIsMember = existingUser.isMember;
    }

    // ==========================================================================
    // 【核心算法】全渠道折扣絕對互斥 + 最優自動判定
    // ==========================================================================
    //
    // Step 1：獨立計算優惠碼折扣金額（基於原始 subtotal，非折後金額）
    // Step 2：調用 determineBestDiscount 進行全渠道比較
    // Step 3：僅採納最優的單一折扣
    // ==========================================================================

    let promoDiscountCents = 0;
    let promoChannel: 'promo_builtin' | 'promo_db' = 'promo_builtin';
    let promoLabel = '';
    let promoCodeDbId: string | null = null;
    let shouldIncrementPromoUsage = false;
    let promoCodeIdForUsage: string | null = null;

    if (promoCode && typeof promoCode === 'string' && promoCode.trim()) {
      // 優先檢查內建優惠碼
      const builtIn = findBuiltInPromoCode(promoCode);
      if (builtIn) {
        // 內建碼：基於原始 subtotal 計算折扣（絕不基於折後金額）
        promoDiscountCents = calculateBuiltInPromoDiscount(subtotal, builtIn);
        promoDiscountCents = Math.min(promoDiscountCents, subtotal);
        promoChannel = 'promo_builtin';
        promoLabel = builtIn.label;
        promoCodeDbId = null;
      } else {
        // 非內建碼：走數據庫查詢
        const foundPromo = await prisma.promoCode.findUnique({
          where: { code: promoCode.trim().toUpperCase() },
        });

        if (foundPromo && foundPromo.isActive) {
          const notExpired = !foundPromo.expiresAt || new Date() <= foundPromo.expiresAt;
          const notExceeded = !foundPromo.maxUses || foundPromo.usedCount < foundPromo.maxUses;
          // 最低消費門檻基於原始 subtotal 判斷
          const meetsMinimum = !foundPromo.minOrderAmount || subtotal >= foundPromo.minOrderAmount;

          if (notExpired && notExceeded && meetsMinimum) {
            if (foundPromo.discountType === 'PERCENTAGE') {
              promoDiscountCents = Math.floor((subtotal * foundPromo.discountValue) / 100);
            } else {
              promoDiscountCents = foundPromo.discountValue;
            }
            promoDiscountCents = Math.min(promoDiscountCents, subtotal);
            promoChannel = 'promo_db';
            promoLabel = '優惠碼折扣';
            promoCodeDbId = foundPromo.id;
            // 標記需要在最終採納時才 increment
            shouldIncrementPromoUsage = true;
            promoCodeIdForUsage = foundPromo.id;
          }
        }
      }
    }

    // Step 2：全渠道最優判定（絕對互斥）
    const bestDiscount = determineBestDiscount(
      subtotal,
      userIsMember,
      promoDiscountCents,
      promoChannel,
      promoLabel,
      promoCodeDbId,
    );

    // Step 3：僅在優惠碼被採納時才 increment 使用次數
    const promoWasChosen = bestDiscount.channel === 'promo_db';
    if (shouldIncrementPromoUsage && promoWasChosen && promoCodeIdForUsage) {
      await prisma.promoCode.update({
        where: { id: promoCodeIdForUsage },
        data: { usedCount: { increment: 1 } },
      });
    }

    // ==========================================================================
    // 計算最終金額
    // ==========================================================================

    const memberDiscountAmount = bestDiscount.memberDiscountForDB;
    const discount = bestDiscount.promoDiscountForDB;

    // 運費基於折扣後金額判定免運門檻
    const afterDiscount = subtotal - bestDiscount.discountAmount;
    const shippingFee = calculateShippingFee(shippingMethod || 'sf_locker', afterDiscount);

    const totalAmount = afterDiscount + shippingFee;

    // 創建訂單
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: 'pending_payment',
        email,
        phone,
        shippingName,
        shippingAddress,
        shippingCity,
        shippingDistrict: shippingDistrict || '',
        shippingMethod: shippingMethod || 'sf_locker',
        shippingFee,
        subtotal,
        memberDiscount: memberDiscountAmount,
        discount,
        totalAmount,
        paymentMethod: paymentMethod || 'card',
        promoCodeId: promoWasChosen ? promoCodeDbId : null,
        userId,
        note: note || '',
        items: {
          create: validatedItems,
        },
        timeline: {
          create: {
            status: 'pending_payment',
            label: '訂單建立',
            description: '您的訂單已成功建立',
          },
        },
      },
      include: {
        items: true,
        timeline: true,
      },
    });

    // 如果付款方式為 FPS/PayMe，發送 WhatsApp 付款碼
    if (paymentMethod === 'fps') {
      sendPaymentQRCodeViaWhatsApp({
        phone,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        paymentMethod: 'fps',
      }).catch((err) => console.error('WhatsApp 發送失敗：', err));
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        memberDiscount: memberDiscountAmount,
        discount,
        appliedDiscountChannel: bestDiscount.channel,
        appliedDiscountLabel: bestDiscount.label,
        appliedDiscountAmount: bestDiscount.discountAmount,
      },
    });
  } catch (error) {
    console.error('創建訂單失敗：', error);
    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}

// 查詢訂單列表
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const phone = searchParams.get('phone');

  if (!email && !phone) {
    return NextResponse.json({ error: '請提供 email 或手機號碼' }, { status: 400 });
  }

  const where: any = {};
  if (email) where.email = email;
  if (phone) where.phone = phone;

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: true,
      timeline: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ orders });
}