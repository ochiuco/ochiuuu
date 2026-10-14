// app/orders/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Copy,
  ExternalLink,
  Check,
} from 'lucide-react';
import { fetchOrder } from '@/lib/api';

type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'completed';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending_payment: { label: '待付款', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  paid: { label: '已付款', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  processing: { label: '備貨中', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  shipped: { label: '已發貨', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  in_transit: { label: '運送中', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  delivered: { label: '已送達', color: 'bg-green-50 text-green-700 border-green-200' },
  completed: { label: '已完成', color: 'bg-gray-50 text-gray-600 border-gray-200' },
};

const allSteps: { status: OrderStatus; label: string }[] = [
  { status: 'pending_payment', label: '訂單建立' },
  { status: 'paid', label: '付款成功' },
  { status: 'processing', label: '備貨中' },
  { status: 'shipped', label: '已發貨' },
  { status: 'in_transit', label: '運送中' },
  { status: 'delivered', label: '已送達' },
  { status: 'completed', label: '已完成' },
];

// 專業用戶端文案映射
const professionalLabels: Record<string, string> = {
  pending_payment: '訂單已建立',
  paid: '付款成功',
  processing: '備貨處理中',
  shipped: '包裹已發出',
  in_transit: '包裹運送中',
  delivered: '包裹已送達',
  completed: '訂單已完成',
  cancelled: '訂單已取消',
};

const professionalDescriptions: Record<string, string> = {
  pending_payment: '您的訂單已成功建立，請盡快完成付款以便我們為您安排出貨。',
  paid: '您的付款已確認成功，我們正在為您安排備貨出庫。',
  processing: '倉庫正在為您揀貨並精心打包，請耐心等候發貨通知。',
  shipped: '您的包裹已打包發出，正前往您的收件地址，請留意近期物流電話/短訊通知。',
  in_transit: '您的包裹正在運輸途中，預計即將送達。',
  delivered: '您的包裹已成功送達，感謝您的購買！如有任何問題歡迎聯繫客服。',
  completed: '訂單已完成，感謝您的支持，期待下次為您服務。',
  cancelled: '此訂單已取消處理。如有疑問請隨時聯繫我們的客服團隊。',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedInTimeline, setCopiedInTimeline] = useState(false);

  useEffect(() => {
    fetchOrder(id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-white pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-6 text-center py-20">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-sm text-gray-400 tracking-wider mb-6">
            找不到此訂單
          </p>
          <Link
            href="/orders"
            className="text-xs tracking-widest text-gray-600 underline underline-offset-4"
          >
            返回訂單查詢
          </Link>
        </div>
      </main>
    );
  }

  const config = statusConfig[order.status] || statusConfig['pending_payment'];
  const currentIndex = allSteps.findIndex((s) => s.status === order.status);

  const handleCopyTracking = async () => {
    if (!order.trackingNumber) return;
    try {
      await navigator.clipboard.writeText(order.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = order.trackingNumber;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyTrackingInTimeline = async () => {
    if (!order.trackingNumber) return;
    try {
      await navigator.clipboard.writeText(order.trackingNumber);
      setCopiedInTimeline(true);
      setTimeout(() => setCopiedInTimeline(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = order.trackingNumber;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedInTimeline(true);
      setTimeout(() => setCopiedInTimeline(false), 2000);
    }
  };

  // 格式化時間線
  const timeline = (order.timeline || []).map((item: any) => ({
    ...item,
    time: new Date(item.createdAt).toLocaleString('zh-HK', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));

  // 獲取事件的專業顯示標題
  const getDisplayLabel = (item: any): string => {
    if (item.status && professionalLabels[item.status]) {
      return professionalLabels[item.status];
    }
    if (item.label === '已發貨') return '包裹已發出';
    if (item.label === '付款成功') return '付款成功';
    return item.label;
  };

  // 獲取事件的專業顯示描述
  const getDisplayDescription = (item: any): React.ReactNode => {
    const isShippedEvent =
      item.status === 'shipped' ||
      item.label === '已發貨' ||
      item.label === '包裹已發出';

    // 特殊處理「已發貨」事件：在描述中嵌入物流單號 + 一鍵複製
    if (isShippedEvent && order.trackingNumber) {
      return (
        <span className="inline-flex flex-wrap items-center gap-1">
          <span>您的包裹已交由物流公司處理，正在為您派送中。物流單號：</span>
          <span className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded px-2 py-0.5">
            <span className="font-mono font-medium text-gray-800 text-xs">
              {order.trackingNumber}
            </span>
            <button
              onClick={handleCopyTrackingInTimeline}
              className="text-gray-400 hover:text-black transition-colors"
              title="複製單號"
            >
              {copiedInTimeline ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </span>
          {copiedInTimeline && (
            <span className="text-[10px] text-green-600 tracking-wider ml-1">已複製</span>
          )}
        </span>
      );
    }

    // 已發貨但沒有物流單號
    if (isShippedEvent && !order.trackingNumber) {
      return '您的包裹已打包發出，正前往您的收件地址，請留意近期物流電話/短訊通知。';
    }

    // 其他狀態：使用專業描述
    if (item.status && professionalDescriptions[item.status]) {
      return professionalDescriptions[item.status];
    }

    // Fallback：過濾掉不適合顯示給用戶的內部描述
    if (item.description) {
      const rawDesc = item.description as string;
      if (
        rawDesc.includes('手動') ||
        rawDesc.includes('管理員') ||
        rawDesc.includes('測試')
      ) {
        if (item.status && professionalDescriptions[item.status]) {
          return professionalDescriptions[item.status];
        }
        return null;
      }
      return rawDesc;
    }

    return null;
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* 返回按鈕 */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="tracking-wider">返回</span>
        </button>

        {/* 訂單標題區 */}
        <div className="bg-white rounded-xl p-6 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-lg font-light tracking-widest">
                  訂單詳情
                </h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] tracking-wider border rounded-full ${config.color}`}>
                  {config.label}
                </span>
              </div>
              <p className="text-xs text-gray-400 tracking-wider font-mono">
                {order.orderNumber}
              </p>
            </div>
            {order.estimatedDelivery && order.status !== 'completed' && (
              <div className="text-right">
                <p className="text-[11px] text-gray-400 tracking-wider">
                  預計送達
                </p>
                <p className="text-sm font-medium tracking-wider mt-0.5">
                  {order.estimatedDelivery}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 物流追蹤 */}
        <div className="bg-white rounded-xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-6">
            <Truck className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-medium tracking-widest">物流追蹤</h2>
          </div>

          {/* 快遞資訊卡片 */}
          {order.trackingNumber && (
            <div className="flex items-center gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-[11px] text-gray-400 tracking-wider">
                  {order.carrier || '順豐速運'}
                </p>
                <p className="text-sm font-mono tracking-wider mt-0.5">
                  {order.trackingNumber}
                </p>
              </div>
              <button
                onClick={handleCopyTracking}
                className="p-2 text-gray-400 hover:text-black transition-colors"
                title="複製單號"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                className="p-2 text-gray-400 hover:text-black transition-colors"
                title="查看物流官網"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 進度條 (橫向) - 桌面版 */}
          <div className="hidden md:block mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-3 left-0 right-0 h-px bg-gray-200" />
              <div
                className="absolute top-3 left-0 h-px bg-black transition-all duration-500"
                style={{ width: `${(currentIndex / (allSteps.length - 1)) * 100}%` }}
              />
              {allSteps.map((step, idx) => {
                const isCompleted = idx <= currentIndex;
                const isCurrent = idx === currentIndex;
                return (
                  <div key={step.status} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        isCompleted ? 'bg-black' : 'bg-white border-2 border-gray-200'
                      } ${isCurrent ? 'ring-4 ring-gray-100' : ''}`}
                    >
                      {isCompleted && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span
                      className={`mt-2 text-[10px] tracking-wider ${
                        isCompleted ? 'text-black font-medium' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 詳細時間線 (縱向) */}
          <div className="space-y-0">
            {[...timeline].reverse().map((item: any, idx: number) => {
              const isLatest = idx === 0;
              const displayLabel = getDisplayLabel(item);
              const displayDescription = getDisplayDescription(item);

              return (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                        isLatest ? 'bg-black' : 'bg-gray-300'
                      }`}
                    />
                    {idx < timeline.length - 1 && (
                      <div className="w-px flex-1 bg-gray-200 my-1" />
                    )}
                  </div>
                  <div className="pb-6">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-sm tracking-wide ${
                          isLatest ? 'text-black font-medium' : 'text-gray-500'
                        }`}
                      >
                        {displayLabel}
                      </span>
                      <span className="text-[11px] text-gray-400">{item.time}</span>
                    </div>
                    {displayDescription && (
                      <div
                        className={`mt-1 text-xs leading-relaxed ${
                          isLatest ? 'text-gray-600' : 'text-gray-400'
                        }`}
                      >
                        {displayDescription}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 商品明細 */}
        <div className="bg-white rounded-xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-medium tracking-widest">商品明細</h2>
          </div>

          <div className="space-y-4">
            {order.items.map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="relative w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image || '/images/testing1.jpeg'}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm tracking-wide text-gray-800 line-clamp-1">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-1 tracking-wider">
                    {item.color} / {item.size}
                    {item.hemming && ' / 修褲腳'}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      x{item.quantity}
                    </span>
                    <span className="text-sm tracking-wider font-medium">
                      HK$ {(((item.price + (item.hemmingFee || 0)) * item.quantity) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 金額明細 */}
          <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="tracking-wider">商品小計</span>
              <span>HK$ {(order.subtotal / 100).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="tracking-wider">運費</span>
              <span>{order.shippingFee === 0 ? '免運費' : `HK$ ${(order.shippingFee / 100).toFixed(2)}`}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex items-center justify-between text-xs text-green-600">
                <span className="tracking-wider">優惠碼折扣</span>
                <span>- HK$ {(order.discount / 100).toFixed(2)}</span>
              </div>
            )}
            {order.memberDiscount > 0 && (
              <div className="flex items-center justify-between text-xs text-green-600">
                <span className="tracking-wider">會員折扣</span>
                <span>- HK$ {(order.memberDiscount / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm font-medium pt-2 border-t border-gray-100">
              <span className="tracking-wider">合計</span>
              <span className="tracking-wider">
                HK$ {(order.totalAmount / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* 收貨資訊 */}
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-gray-600" />
            <h2 className="text-sm font-medium tracking-widest">收貨資訊</h2>
          </div>
          <div className="space-y-1.5 text-sm text-gray-600">
            <p className="tracking-wider">{order.shippingName}</p>
            <p className="text-xs text-gray-400 tracking-wider">
              {order.phone}
            </p>
            <p className="text-xs text-gray-400 tracking-wider">
              {order.shippingAddress}
              {order.shippingDistrict && `, ${order.shippingDistrict}`}
              {order.shippingCity && ` ${order.shippingCity}`}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}