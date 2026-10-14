// app/api/checkout/airwallex/route.ts
// Airwallex 收款：建立 PaymentIntent（AlipayHK + WeChat Pay HK）
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAirwallexPaymentIntent, getAirwallexEnv } from '@/lib/airwallex';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
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

    // 僅 香港支付寶 (AlipayHK) 走 Airwallex
    if (order.paymentMethod !== 'alipay_hk') {
      return NextResponse.json(
        { error: '此付款方式不適用 Airwallex' },
        { status: 400 }
      );
    }

    // 付款完成後 Airwallex 會帶 intent 資訊重定向回此頁，由成功頁負責驗證
    const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?order_id=${order.id}&provider=airwallex`;

    const intent = await createAirwallexPaymentIntent({
      amountCents: order.totalAmount,
      currency: 'HKD',
      merchantOrderId: order.orderNumber,
      returnUrl,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });

    // 記錄 Airwallex intent id，方便對賬與 webhook 對應
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: intent.id },
    });

    return NextResponse.json({
      intentId: intent.id,
      clientSecret: intent.client_secret,
      currency: intent.currency,
      env: getAirwallexEnv(),
    });
  } catch (error) {
    console.error('Airwallex Checkout 失敗：', error);
    const message = error instanceof Error ? error.message : '創建支付失敗';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
