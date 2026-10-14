"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Shield } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';

export default function PrivacyPolicyPage() {
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
            <Shield className="w-5 h-5 text-gray-600" />
            <h1 className="text-2xl font-light tracking-widest text-gray-900">隱私政策</h1>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="space-y-8 text-sm text-gray-600 leading-relaxed">
            <p className="text-xs text-gray-400 tracking-wider">最後更新日期：2026 年 1 月</p>

            <section className="space-y-3">
              <h2 className="text-base font-medium text-gray-900 tracking-wider">1. 資料收集</h2>
              <p>當您在 O'CHIU 網站購物或註冊帳戶時，我們可能收集以下個人資料：</p>
              <ul className="space-y-2 pl-4">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>姓名、電子郵箱、聯絡電話</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>配送地址及帳單地址</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>訂單記錄及交易資訊</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>瀏覽記錄及設備資訊（透過 Cookies）</span>
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-medium text-gray-900 tracking-wider">2. 資料用途</h2>
              <p>我們收集的個人資料僅用於以下目的：</p>
              <ul className="space-y-2 pl-4">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>處理及配送您的訂單</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>會員帳戶管理及積分記錄</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>發送訂單確認及物流通知</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>經您同意後發送推廣資訊及優惠通知</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>改善網站體驗及客戶服務</span>
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-medium text-gray-900 tracking-wider">3. 資料保護</h2>
              <p>我們採用業界標準的安全措施保護您的個人資料，包括 SSL 加密傳輸、安全的支付閘道（Stripe）、以及嚴格的內部資料存取控制。我們不會將您的個人資料出售或提供予第三方作營銷用途。</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-medium text-gray-900 tracking-wider">4. 第三方服務</h2>
              <p>為提供完整的購物體驗，我們可能使用以下第三方服務處理您的資料：</p>
              <ul className="space-y-2 pl-4">
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Stripe（支付處理）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>順豐速運（物流配送）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span>Resend（郵件通知）</span>
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-medium text-gray-900 tracking-wider">5. 您的權利</h2>
              <p>根據香港《個人資料（私隱）條例》，您有權查閱及更正我們持有的個人資料。如需行使此權利或有任何隱私相關查詢，請聯絡 ochiuuu@gmail.com。</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-medium text-gray-900 tracking-wider">6. Cookies</h2>
              <p>本網站使用 Cookies 以改善您的瀏覽體驗、記住您的偏好設定及分析網站流量。您可以透過瀏覽器設定管理或拒絕 Cookies。</p>
            </section>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-xs text-gray-400 tracking-wider">
                本隱私政策受香港特別行政區法律管轄。O'CHIU 保留隨時修改本政策的權利，修改後將於本頁面更新。
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}