// app/api/webhook/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { handlePaymentSuccess } from '@/lib/order-payment';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook 簽名驗證失敗：', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      try {
        await handlePaymentSuccess(orderId, session.id);
      } catch (error) {
        console.error('Webhook handlePaymentSuccess 錯誤：', error);
      }
    }
  }

  // WeChat Pay 移動端透過 PaymentIntents 完成，監聽此事件
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as Stripe.PaymentIntent;
    const orderId = pi.metadata?.orderId;

    if (orderId) {
      try {
        await handlePaymentSuccess(orderId, pi.id);
      } catch (error) {
        console.error('Webhook payment_intent.succeeded 錯誤：', error);
      }
    }
  }

  return NextResponse.json({ received: true });
}