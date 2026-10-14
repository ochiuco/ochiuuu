"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Truck } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';

export default function DeliveryPage() {
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
            <Truck className="w-5 h-5 text-gray-600" />
            <h1 className="text-2xl font-light tracking-widest text-gray-900">配送說明</h1>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="prose prose-sm max-w-none space-y-8">
            <p className="text-sm text-gray-600 leading-relaxed">
              O'CHIU 為您提供靈活的取貨方式。現貨訂單會於確認付款後 <strong>一星期內</strong> 寄出（預訂貨品除外，處理時間較長）。請於下單前確認收件人資料，訂單一經提交恕不接受更改。
            </p>

            {/* 香港地區 */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h2 className="text-base font-medium tracking-wider flex items-center gap-2">
                📍 香港地區
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium tracking-wider mb-2">順豐速遞</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                      <span>滿 HK$500 免運費（僅限順豐自取點 / 智能櫃自取）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                      <span>住宅派送：運費到付（由收件人支付）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                      <span>一般 1-2 個工作天送達</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-medium tracking-wider mb-2">門市自取</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                      <span>免運費</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                      <span>每月特定開放時間（非固定營業日）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                      <span>強烈建議提前透過 IG DM 或 Email 預約</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                      <span>逾期未取可能收取合理存倉費用</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 台灣及澳門 */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              <h2 className="text-base font-medium tracking-wider flex items-center gap-2">
                🌐 台灣及澳門地區
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium tracking-wider mb-2">順豐速遞</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                      <span>滿 HK$800 免運費</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                      <span>一般需 4-10 個工作天（視清關及地區而定）</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                      <span>結帳時會顯示預估運費及時間</span>
                    </li>
                  </ul>
                </div>

                <p className="text-sm text-gray-600">
                  目前暫未支援其他海外地區。如有需要請先聯絡我們查詢。
                </p>
              </div>
            </div>

            {/* 溫馨提示 */}
            <div className="border-l-2 border-black pl-4 py-2">
              <p className="text-sm text-gray-600 leading-relaxed">
                <strong>溫馨提示：</strong>門市自取時間為每月特定日子，詳情請參考網站最新公告或直接 IG DM 我們確認。為確保您有足夠時間試穿及選購，建議提前預約。
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}