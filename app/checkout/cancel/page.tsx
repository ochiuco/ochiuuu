// app/checkout/cancel/page.tsx
"use client";

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { X, RotateCcw, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

function CancelContent() {
  const router = useRouter();

  // 返回結帳頁，會自動還原到付款選擇步驟（購物車與表單資料皆保留）
  const handleRetry = () => {
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-6">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
          <X className="w-8 h-8 text-gray-400" />
        </div>

        <h1
          className="text-2xl font-medium tracking-wider"
          style={{ fontFamily: '"Montserrat", serif', letterSpacing: '0.15em' }}
        >
          付款已取消
        </h1>

        <p className="text-sm text-gray-500 leading-relaxed">
          您的訂單尚未完成付款。您可以重新嘗試付款，或返回繼續購物。
        </p>

        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={handleRetry}
            className="w-full py-4 bg-black text-white text-sm tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            重新選擇付款方式
          </button>
          <Link
            href="/products"
            className="w-full py-4 border border-gray-200 text-sm tracking-widest text-center hover:border-black transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            繼續購物
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <CancelContent />
    </Suspense>
  );
}