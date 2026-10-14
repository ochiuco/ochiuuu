"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, HelpCircle, ChevronDown } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';

const faqs = [
  {
    q: "訂單提交後可以取消或更改嗎？",
    a: "訂單一經提交並完成付款，恕不接受取消或任何更改（包括尺寸、顏色、收件地址）。請下單前仔細確認所有資料。如有特殊情況，請盡快聯絡我們，我們會盡力協助。",
  },
  {
    q: "門市自取的地址和最新時間？",
    a: "我們的 Workshop 地址為：荔枝角青山道688-690號嘉名工廠大廈B座10樓B室21號房。開放時間為每月特定日子，請參考網站最新公告或直接 IG DM 我們確認。",
  },
  {
    q: "什麼情況可以申請換貨？",
    a: "僅限貨品存在嚴重製造瑕疵（詳見退換政策）。尺寸不合或個人喜好恕不接受。確認後我們會安排換貨（同款同碼有貨時）。退換會於收到退貨並檢查無誤後 7-14 個工作天處理。",
  },
  {
    q: "部分產品有剪裁服務嗎？",
    a: "是的，部分產品提供專業剪裁服務。購買前請聯絡我們確認該產品是否支援剪裁、預計調整範圍及相關安排。",
  },
  {
    q: "如何聯絡 O'CHIU 團隊？",
    a: "最快的方式是透過 Instagram DM @ochiu。我們通常會在 24 小時內回覆。您也可以使用網站聯絡表單或 Email 聯絡我們。",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
            <HelpCircle className="w-5 h-5 text-gray-600" />
            <h1 className="text-2xl font-light tracking-widest text-gray-900">常見問題</h1>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="divide-y divide-gray-100">
            {faqs.map((faq, index) => (
              <div key={index} className="py-5">
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-start justify-between text-left gap-4"
                >
                  <span className="text-sm font-medium tracking-wider text-gray-900">
                    Q: {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="mt-3 pl-0">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      A: {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="mt-12 p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-sm text-gray-500 tracking-wider mb-3">
              沒找到您的問題？
            </p>
            <Link
              href="/help/contact"
              className="inline-block px-8 py-3 bg-black text-white text-xs tracking-widest hover:bg-gray-800 transition-colors"
            >
              聯繫我們
            </Link>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}