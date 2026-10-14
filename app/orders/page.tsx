// app/orders/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ChevronRight, Search, Mail } from 'lucide-react';
import { fetchOrdersByEmail } from '@/lib/api';

const statusConfig: Record<string, { label: string; color: string }> = {
  pending_payment: { label: '待付款', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  paid: { label: '已付款', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  processing: { label: '備貨中', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  shipped: { label: '已發貨', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  in_transit: { label: '運送中', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  delivered: { label: '已送達', color: 'bg-green-50 text-green-700 border-green-200' },
  completed: { label: '已完成', color: 'bg-gray-50 text-gray-600 border-gray-200' },
};

const tabs: { label: string; value: string }[] = [
  { label: '全部', value: 'all' },
  { label: '進行中', value: 'active' },
  { label: '已完成', value: 'completed' },
];

export default function OrdersPage() {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const data = await fetchOrdersByEmail(email.trim());
      setOrders(data);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchTab =
      activeTab === 'all' ||
      (activeTab === 'active' && order.status !== 'completed') ||
      (activeTab === 'completed' && order.status === 'completed');

    const matchSearch =
      !searchQuery ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchTab && matchSearch;
  });

  if (!searched) {
    return (
      <main className="min-h-screen bg-white pt-28 pb-20">
        <div className="max-w-md mx-auto px-6 text-center">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-6" />
          <h1 className="text-2xl font-light tracking-widest text-gray-900 mb-2">
            訂單查詢
          </h1>
          <p className="text-sm text-gray-400 tracking-wider mb-8">
            輸入您的電子郵箱查看訂單狀態
          </p>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-4 border border-gray-200 text-sm tracking-wider focus:outline-none focus:border-black transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white text-sm tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? '查詢中...' : '查詢訂單'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* 標題 */}
        <div className="mb-10">
          <h1 className="text-2xl font-light tracking-widest text-gray-900">
            我的訂單
          </h1>
          <p className="mt-2 text-sm text-gray-400 tracking-wider">
            {email} 的訂單記錄
          </p>
        </div>

        {/* 搜尋 + 篩選 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 text-xs tracking-wider rounded-md transition-all ${
                  activeTab === tab.value
                    ? 'bg-white text-black shadow-sm font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋訂單編號"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full sm:w-64 text-xs tracking-wider border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>
        </div>

        {/* 訂單列表 */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-sm text-gray-400 tracking-wider">暫無訂單</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order: any) => {
              const config = statusConfig[order.status] || statusConfig['pending_payment'];
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block border border-gray-100 rounded-lg p-5 hover:border-gray-200 hover:shadow-sm transition-all group"
                >
                  {/* 頂部：訂單號 + 狀態 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 tracking-wider font-mono">
                        {order.orderNumber}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] tracking-wider border rounded-full ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>

                  {/* 商品預覽 */}
                  <div className="flex items-center gap-3 mb-4">
                    {order.items.slice(0, 3).map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="relative w-14 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0"
                      >
                        <Image
                          src={item.image || '/images/testing1.jpeg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{order.items.length - 3}
                      </span>
                    )}
                    <div className="ml-auto text-right">
                      <p className="text-sm font-medium tracking-wider">
                        HK$ {(order.totalAmount / 100).toFixed(2)}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        共 {order.items.reduce((sum: number, i: any) => sum + i.quantity, 0)} 件
                      </p>
                    </div>
                  </div>

                  {/* 底部資訊 */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="text-[11px] text-gray-400">
                      下單時間：{new Date(order.createdAt).toLocaleDateString('zh-HK')}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}