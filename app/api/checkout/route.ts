// app/api/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: '缺少訂單 ID' }, { status: 400 });
    }

    // 獲取訂單
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    if (order.status !== 'pending_payment') {
      return NextResponse.json({ error: '該訂單已支付或已取消' }, { status: 400 });
    }

    // ============ FPS / PayMe 本地支付：跳過 Stripe，直接返回 ============
    if (order.paymentMethod === 'fps' || order.paymentMethod === 'payme') {
      // 訂單保持 pending_payment 狀態，等待管理員手動核銷
      // 創建訂單事件記錄
      await prisma.orderEvent.create({
        data: {
          orderId: order.id,
          status: 'pending_payment',
          label: '等待付款',
          description: `請透過 ${order.paymentMethod === 'fps' ? 'FPS' : 'PayMe'} 完成轉帳`,
        },
      });

      return NextResponse.json({
        success: true,
        paymentMethod: order.paymentMethod,
        orderId: order.id,
        redirectUrl: `/checkout/success?order_id=${order.id}&method=${order.paymentMethod}`,
      });
    }

    // ============ Stripe 線上支付流程 ============
    // 構建 Stripe line items
    const lineItems = order.items.map((item) => {
      const unitAmount = item.price + item.hemmingFee;
      const description = item.hemming
        ? `${item.color} / ${item.size}（含修褲腳）`
        : `${item.color} / ${item.size}`;

      return {
        price_data: {
          currency: 'hkd',
          product_data: {
            name: item.name,
            description,
            images: item.image ? [`${process.env.NEXT_PUBLIC_BASE_URL}${item.image}`] : undefined,
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    // 如果有運費，加入運費
    if (order.shippingFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'hkd',
          product_data: {
            name: '運費',
            description: order.shippingMethod === 'sf_delivery' ? '順豐到家' : '順豐自提櫃',
            images: undefined,
          },
          unit_amount: order.shippingFee,
        },
        quantity: 1,
      });
    }

    // 折扣處理（互斥邏輯保證：memberDiscount 和 discount 只有其一非零）
    const totalDiscount = order.memberDiscount + order.discount;
    let discounts: { coupon: string }[] | undefined;

    if (totalDiscount > 0) {
      let couponName: string;
      if (order.memberDiscount > 0) {
        couponName = '會員/開業優惠 (9折)';
      } else {
        couponName = '優惠碼折扣';
      }

      const coupon = await stripe.coupons.create({
        amount_off: totalDiscount,
        currency: 'hkd',
        duration: 'once',
        name: couponName,
      });
      discounts = [{ coupon: coupon.id }];
    }

    // ============ Stripe Checkout Session ============
    // 信用卡：標準 Stripe 表單
    // 支付寶（大陸）：Stripe 自動偵測設備，掃碼或跳轉支付寶
    // 微信支付：client: 'web' 顯示 QR 碼（桌面與手機皆掃碼，H5 喚醒待日後申請）
    let paymentMethodTypes: ('card' | 'alipay' | 'wechat_pay')[];

    if (order.paymentMethod === 'alipay') {
      paymentMethodTypes = ['alipay'];
    } else if (order.paymentMethod === 'wechat_pay') {
      paymentMethodTypes = ['wechat_pay'];
    } else {
      paymentMethodTypes = ['card'];
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethodTypes,
      ...(order.paymentMethod === 'wechat_pay' && {
        payment_method_options: {
          wechat_pay: { client: 'web' },
        },
      }),
      mode: 'payment',
      line_items: lineItems,
      discounts,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel?order_id=${order.id}`,
      customer_email: order.email,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: session.id },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout 失敗：', error);
    const message =
      error instanceof Error ? error.message : '創建支付失敗';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}