"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, FileText } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';

export default function TermsPage() {
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
            <FileText className="w-5 h-5 text-gray-600" />
            <h1 className="text-2xl font-light tracking-widest text-gray-900">服務條款</h1>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="space-y-8 text-sm text-gray-600 leading-relaxed">
            <p className="text-xs text-gray-400 tracking-wider">最後更新日期：2026 年 1 月</p>

            <section className="space-y-3">
              <h2 className="text-base font-medium text-gray-900 tracking-wider">1. 總則</h2>
              <p>歡迎使用 O'CHIU 網站（以下簡稱「本網站」）。當您訪問、瀏覽或使用本網站時，即表示您同意遵守以下條款及細則。如您不同意任何條款，請停止使用本網站。</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-medium text-gray-900 tracking-wider">2. 商品與定價</h2>
              <ul className="space-y-2 pl-4">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>所有商品價格以港幣（HKD）標示，已包含適用稅項。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>我們保留隨時調整商品價格的權利，但已確認的訂單不受影響。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>商品圖片僅供參考，實際顏色可能因顯示器設定而略有差異。</span>
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-medium text-gray-900 tracking-wider">3. 訂單與付款</h2>
              <ul className="space-y-2 pl-4">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>訂單一經提交並完成付款，恕不接受取消或更改。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>我們接受信用卡、支付寶、微信支付及轉數快（FPS）付款。</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>如因庫存不足無法履行訂單，我們將全額退款並通知您。</span>
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-medium text-gray-900 tracking-wider">4. 配送</h2>
              <p>配送時間及費用詳情，請參閱我們的 <Link href="/help/delivery" className="text-black underline underline-offset-4">配送說明</Link> 頁面。</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-medium text-gray-900 tracking-wider">5. 退換貨政策</h2>
              <p>本網站僅接受因嚴重製造瑕疵而產生的換貨申請，不設退貨退款。詳情請參閱 <Link href="/help/return-policy" className="text-black underline underline-offset-4">退換政策</Link>。</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-medium text-gray-900 tracking-wider">6. 知識產權</h2>
              <p>本網站所有內容（包括但不限於文字、圖片、設計、商標及程式碼）均為 O'CHIU 所有或已獲授權使用。未經書面許可，不得複製、修改或分發。</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-medium text-gray-900 tracking-wider">7. 免責聲明</h2>
              <p>本網站按「現狀」提供。我們不保證網站不會中斷或無錯誤。在法律允許的最大範圍內，O'CHIU 不對因使用本網站而產生的任何直接或間接損失承擔責任。</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-medium text-gray-900 tracking-wider">8. 適用法律</h2>
              <p>本服務條款受香港特別行政區法律管轄。如有任何爭議，雙方同意先以友好協商方式解決；如協商不成，則交由香港法院管轄。</p>
            </section>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-xs text-gray-400 tracking-wider">
                O'CHIU 保留對以上條款及細則的最終解釋及修改權利。如有任何爭議，我們會以友好態度與您協商解決。
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}