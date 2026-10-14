// app/api/checkout/airwallex/verify/route.ts
// Airwallex 付款驗證（成功頁返回時調用，webhook 之外的雙保險）
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { retrieveAirwallexPaymentIntent } from '@/lib/airwallex';
import { handlePaymentSuccess } from '@/lib/order-payment';

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

    if (!order || !order.paymentId) {
      return NextResponse.json({ error: '訂單不存在或無支付記錄' }, { status: 404 });
    }

    // 用訂單存的 Airwallex intent id 查最新狀態
    const intent = await retrieveAirwallexPaymentIntent(order.paymentId);

    // Airwallex 成功狀態：SUCCEEDED（已捕獲）
    if (intent.status === 'SUCCEEDED') {
      // 冪等：handlePaymentSuccess 會跳過已處理的訂單
      await handlePaymentSuccess(orderId, intent.id);
      return NextResponse.json({ verified: true, status: 'paid' });
    }

    return NextResponse.json({ verified: false, status: intent.status });
  } catch (error) {
    console.error('Airwallex 付款驗證失敗：', error);
    return NextResponse.json({ error: '驗證失敗' }, { status: 500 });
  }
}
