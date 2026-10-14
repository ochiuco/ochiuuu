"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Ruler } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';

export default function SizeGuidePage() {
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
            <Ruler className="w-5 h-5 text-gray-600" />
            <h1 className="text-2xl font-light tracking-widest text-gray-900">尺碼指南</h1>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="space-y-8">
            <p className="text-sm text-gray-600 leading-relaxed">
              每件 O'CHIU 服裝均有獨立的詳細尺碼表，請務必於產品詳情頁查看具體尺寸數據（胸圍、衣長、袖長、肩寬等）。
            </p>

            {/* 量度小貼士 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-base font-medium tracking-wider mb-4">量度小貼士</h2>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-black text-white text-xs flex items-center justify-center rounded-full flex-shrink-0">1</span>
                  <span>使用軟尺，貼身但不緊繃地量度胸圍、腰圍、臀圍。</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-black text-white text-xs flex items-center justify-center rounded-full flex-shrink-0">2</span>
                  <span>對比產品頁的尺寸表，注意版型設計 (oversize / regular / slim)。</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-black text-white text-xs flex items-center justify-center rounded-full flex-shrink-0">3</span>
                  <span>如介乎兩個碼數，建議參考模特兒身高體型，或選擇較寬鬆的一碼。</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-black text-white text-xs flex items-center justify-center rounded-full flex-shrink-0">4</span>
                  <span>布料彈性、剪裁及個人喜好會影響穿著感覺，建議親臨門市試穿。</span>
                </li>
              </ol>
            </div>

            {/* 提醒 */}
            <div className="border-l-2 border-black pl-4 py-2">
              <p className="text-sm text-gray-600 leading-relaxed">
                由於每季產品版型及布料可能略有不同，尺寸表僅供參考。如有疑問歡迎聯絡我們。
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}