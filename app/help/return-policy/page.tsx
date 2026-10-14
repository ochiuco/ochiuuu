"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';

export default function ReturnPolicyPage() {
  return (
    <main className="min-h-screen bg-white pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <FadeIn>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="tracking-wider">返回首頁</span>
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <RotateCcw className="w-5 h-5 text-gray-600" />
            <h1 className="text-2xl font-light tracking-widest text-gray-900">退換政策</h1>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="space-y-8">
            {/* 重要聲明 */}
            <div className="bg-red-50 border border-red-100 p-6 rounded-lg">
              <h2 className="text-base font-medium tracking-wider mb-3 flex items-center gap-2">
                ❗️ 重要聲明
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                服裝為個人穿著物品。為保障所有顧客能收到全新、未經試穿的貨品，網店所購買的服裝 <strong>如因尺寸不合、顏色偏好、個人喜好或版型不喜歡等原因，恕不接受退換</strong>。購買前請務必詳細閱讀產品頁面的尺寸表、模特兒實穿照片、布料描述及注意事項。
              </p>
            </div>

            {/* 可接受退換 */}
            <div className="bg-green-50 border border-green-100 p-6 rounded-lg">
              <h2 className="text-base font-medium tracking-wider mb-3 flex items-center gap-2">
                ✅ 可接受退換（僅限換貨）
              </h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span>嚴重製造瑕疵（破損、污漬、嚴重脫線、拉鍊/扣子損壞、版型嚴重歪斜）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span>收到貨品後請立即檢查，並於 <strong>7 天內</strong> 聯絡我們</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span>需提供清晰照片、訂單編號及問題描述</span>
                </li>
              </ul>
            </div>

            {/* 恕不接受退換 */}
            <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
              <h2 className="text-base font-medium tracking-wider mb-3 flex items-center gap-2">
                ❌ 恕不接受退換
              </h2>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>尺寸不合、顏色與預期有落差（顯示器/燈光差異）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>輕微線頭、正常布料氣味、輕微皺摺或輕微色差</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>已穿著、試穿後有痕跡、已清洗或已剪裁改動</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>超過 7 天或未保持原包裝、吊牌完整</span>
                </li>
              </ul>
            </div>

            {/* 剪裁服務 */}
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg">
              <h2 className="text-base font-medium tracking-wider mb-3 flex items-center gap-2">
                ✂️ 剪裁服務
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                部分產品提供專業剪裁服務，適合需要調整長度或細微版型的顧客。購買時請於備註欄說明需求，或購買前聯絡我們確認可行性及相關安排。
              </p>
            </div>

            {/* 處理時間 */}
            <div className="border-l-2 border-black pl-4 py-2">
              <p className="text-sm text-gray-600 leading-relaxed">
                退換會於收到退貨並檢查無誤後 <strong>7-14 個工作天</strong> 處理。
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}