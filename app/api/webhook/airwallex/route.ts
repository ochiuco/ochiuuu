// app/api/webhook/airwallex/route.ts
// 接收 Airwallex 付款通知（AlipayHK / WeChat Pay HK）
//
// 簽名驗證：x-signature = HMAC-SHA256(`${x-timestamp}${rawBody}`)，密鑰為 webhook secret。
// 為防重放攻擊，拒絕 5 分鐘前的請求。驗簽通過後復用 handlePaymentSuccess 完成訂單。
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { handlePaymentSuccess } from '@/lib/order-payment';

function verifySignature(
  rawBody: string,
  timestamp: string,
  signature: string,
  secret: string
): boolean {
  const valueToDigest = `${timestamp}${rawBody}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(valueToDigest)
    .digest('hex');

  // 長度不一致時 timingSafeEqual 會拋錯，先擋掉
  if (expected.length !== signature.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const timestamp = request.headers.get('x-timestamp');
  const signature = request.headers.get('x-signature');
  const secret = process.env.AIRWALLEX_WEBHOOK_SECRET;

  if (!secret) {
    console.error('Airwallex webhook：缺少 AIRWALLEX_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  if (!timestamp || !signature) {
    return NextResponse.json({ error: 'Missing signature headers' }, { status: 400 });
  }

  // 防重放：拒絕 5 分鐘前的請求
  const tsMs = Number(timestamp);
  if (!Number.isFinite(tsMs) || Math.abs(Date.now() - tsMs) > 5 * 60 * 1000) {
    return NextResponse.json({ error: 'Timestamp out of tolerance' }, { status: 400 });
  }

  if (!verifySignature(rawBody, timestamp, signature, secret)) {
    console.error('Airwallex webhook 簽名驗證失敗');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: { name?: string; data?: { object?: any } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // payment_intent.succeeded：付款成功，完成訂單
  if (event.name === 'payment_intent.succeeded') {
    const intent = event.data?.object;
    const orderId = intent?.metadata?.orderId;
    const paymentId = intent?.id;

    if (orderId && paymentId) {
      try {
        await handlePaymentSuccess(orderId, paymentId);
      } catch (error) {
        console.error('Airwallex webhook handlePaymentSuccess 錯誤：', error);
        // 仍返回 200，避免 Airwallex 重複推送；錯誤已記錄
      }
    }
  }

  return NextResponse.json({ received: true });
}
