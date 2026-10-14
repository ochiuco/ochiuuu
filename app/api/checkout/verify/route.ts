// app/api/checkout/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { handlePaymentSuccess } from '@/lib/order-payment';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-08-26.dahlia',
});

/**
 * 付款驗證端點
 * 
 * 當用戶從 Stripe 支付頁面返回 success page 時調用
 * 用途：確保即使 Webhook 尚未到達，訂單狀態也能立刻同步為 'paid'
 * 內建冪等性：handlePaymentSuccess 會跳過已處理的訂單
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId, orderId } = await request.json();

    if (!sessionId || !orderId) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 });
    }

    // 從 Stripe 檢索 session 狀態
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // 觸發付款成功處理邏輯（冪等，不會重複執行）
      await handlePaymentSuccess(orderId, sessionId);
      return NextResponse.json({ verified: true, status: 'paid' });
    }

    return NextResponse.json({ verified: false, status: session.payment_status });
  } catch (error) {
    console.error('付款驗證失敗：', error);
    return NextResponse.json({ error: '驗證失敗' }, { status: 500 });
  }
}