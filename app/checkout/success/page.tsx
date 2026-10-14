// app/checkout/success/page.tsx
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, Package, Clock, Copy } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchOrder } from '@/lib/api';
import useCartStore from '@/store/useCartStore';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id');
  const sessionId = searchParams.get('session_id');
  const method = searchParams.get('method');
  const provider = searchParams.get('provider');
  const clearCart = useCartStore((state) => state.clearCart);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      // Stripe 付款：驗證 session
      if (sessionId) {
        try {
          await fetch('/api/checkout/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, orderId }),
          });
        } catch (e) {
          console.error('Verify error:', e);
        }
      }

      // Airwallex 付款（AlipayHK / WeChat Pay HK）：驗證 PaymentIntent 狀態
      if (provider === 'airwallex') {
        try {
          await fetch('/api/checkout/airwallex/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId }),
          });
        } catch (e) {
          console.error('Airwallex verify error:', e);
        }
      }

      // Stripe / Airwallex 付款已完成（能到達此頁即代表付款流程結束），清空購物車與結帳狀態
      if (sessionId || provider === 'airwallex') {
        try {
          clearCart();
          sessionStorage.removeItem('ochiu_checkout_state');
        } catch {
          // 忽略
        }
      }

      // 獲取訂單資訊
      try {
        const data = await fetchOrder(orderId);
        setOrder(data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };

    verify();
  }, [orderId, sessionId, provider, clearCart]);

  const handleCopyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 判斷是否為 FPS / PayMe 本地支付
  const isFps = order?.paymentMethod === 'fps' || method === 'fps';
  const isPayme = order?.paymentMethod === 'payme' || method === 'payme';
  const isLocalPayment = isFps || isPayme;
  const isPending = order?.status === 'pending_payment';

  // ============ FPS / PayMe 收款碼頁面 ============
  if (isLocalPayment && isPending) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md w-full space-y-6">
          {/* 狀態 Icon */}
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>

          <h1
            className="text-2xl font-medium tracking-wider"
            style={{ fontFamily: '"Montserrat", serif', letterSpacing: '0.15em' }}
          >
            待付款
          </h1>

          {order && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <p className="text-sm text-gray-500">
                  訂單編號：<span className="text-black font-medium font-mono">{order.orderNumber}</span>
                </p>
                <button
                  type="button"
                  onClick={handleCopyOrderNumber}
                  className="p-1 text-gray-400 hover:text-black transition-colors"
                  title="複製訂單號"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="bg-gray-50 p-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">訂單總額</span>
                  <span className="font-medium text-lg">HK$ {(order.totalAmount / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">付款方式</span>
                  <span className="font-medium">{isFps ? 'FPS 轉數快' : 'PayMe'}</span>
                </div>
              </div>

              {/* 收款二維碼 */}
              <div className="border border-gray-200 p-6 space-y-4">
                <p className="text-sm font-medium tracking-wider text-center">
                  {isFps ? 'FPS 轉數快收款碼' : 'PayMe 收款碼'}
                </p>
                <div className="flex justify-center">
                  <div className="relative w-64 h-64">
                    <Image
                      src={isFps ? '/images/fps-qr.jpeg' : '/images/payme-qr.jpeg'}
                      alt={isFps ? 'FPS QR Code' : 'PayMe QR Code'}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* 指引文案 */}
              <div className="bg-amber-50 border border-amber-200 p-5 text-left space-y-3">
                <p className="text-sm text-amber-800 font-medium tracking-wider">付款指引</p>
                <p className="text-sm text-amber-700 leading-relaxed">
                  請掃描上方二維碼完成付款。轉帳時請在備註欄填寫您的訂單號。完成付款後，請將轉帳截圖發送至我們的 WhatsApp 或 IG @ochiu 進行核對。我們核實後將立即為您發貨。
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Link
              href="/products"
              className="flex-1 py-4 border border-gray-200 text-sm tracking-widest text-center hover:border-black transition-colors"
            >
              繼續購物
            </Link>
            <Link
              href={order ? `/orders/${order.id}` : '/orders'}
              className="flex-1 py-4 bg-black text-white text-sm tracking-widest text-center hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              查看訂單
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============ Stripe 支付成功頁面（原邏輯） ============
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-6">
        <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-white" />
        </div>

        <h1
          className="text-2xl font-medium tracking-wider"
          style={{ fontFamily: '"Montserrat", serif', letterSpacing: '0.15em' }}
        >
          感謝您的訂單
        </h1>

        {order && (
          <>
            <p className="text-sm text-gray-500 leading-relaxed">
              訂單編號：<span className="text-black font-medium">{order.orderNumber}</span>
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              我們已將訂單確認郵件發送至 {order.email}
            </p>

            <div className="bg-gray-50 p-6 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">訂單總額</span>
                <span className="font-medium">HK$ {(order.totalAmount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">配送至</span>
                <span>{order.shippingCity} {order.shippingAddress}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">訂單狀態</span>
                <span className="text-green-600">已支付</span>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-3 pt-4">
          <Link
            href="/products"
            className="flex-1 py-4 border border-gray-200 text-sm tracking-widest text-center hover:border-black transition-colors"
          >
            繼續購物
          </Link>
          <Link
            href={order ? `/orders/${order.id}` : '/orders'}
            className="flex-1 py-4 bg-black text-white text-sm tracking-widest text-center hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            查看訂單
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SuccessContent />
    </Suspense>
  );
}