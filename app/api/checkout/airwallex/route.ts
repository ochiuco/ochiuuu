// app/api/checkout/airwallex/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAirwallexCheckoutSession } from '@/lib/airwallex';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  console.log("🚀 Airwallex checkout API hit");

  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: '缺少訂單 ID' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: '訂單不存在' }, { status: 404 });
    }

    if (order.status !== 'pending_payment') {
      return NextResponse.json({ error: '該訂單已支付或已取消' }, { status: 400 });
    }

    if (order.paymentMethod !== 'alipay_hk') {
      return NextResponse.json(
        { error: '此付款方式不適用 Airwallex' },
        { status: 400 }
      );
    }

    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?order_id=${order.id}&provider=airwallex`;

    // 👈 呼叫新建立的 Checkout Session API
    const checkoutSession = await createAirwallexCheckoutSession({
      amountCents: order.totalAmount,
      currency: 'HKD',
      merchantOrderId: order.orderNumber,
      successUrl: returnUrl,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });

    // 記錄 Airwallex checkout session id，方便對賬與 webhook 對應
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: checkoutSession.id },
    });

    // 👈 回傳 url 給前端
    // 回傳所有常見網址欄位別名，確保前端 100% 讀得到
    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
      checkoutUrl: checkoutSession.url,
      paymentUrl: checkoutSession.url,
      redirectUrl: checkoutSession.url,
    });

  } catch (error) {
    console.error('Airwallex Checkout 失敗：', error);
    const message = error instanceof Error ? error.message : '創建支付失敗';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}