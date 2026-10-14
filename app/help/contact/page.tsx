"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
            <Mail className="w-5 h-5 text-gray-600" />
            <h1 className="text-2xl font-light tracking-widest text-gray-900">聯繫我們</h1>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* 聯絡方式 */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg space-y-5">
                <h2 className="text-sm font-medium tracking-widest">聯絡方式</h2>

                <div className="flex items-start gap-3">
                  <MessageCircle className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 tracking-wider mb-1">Instagram DM（最快）</p>
                    <a
                      href="https://instagram.com/ochiu.co"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-black hover:underline tracking-wider"
                    >
                      @ochiu
                    </a>
                    <p className="text-xs text-gray-400 mt-1">通常 24 小時內回覆</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 tracking-wider mb-1">電子郵箱</p>
                    <a
                      href="mailto:ochiuuu@gmail.com"
                      className="text-sm text-black hover:underline tracking-wider"
                    >
                      ochiuuu@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 tracking-wider mb-1">WhatsApp</p>
                    <a
                      href="https://wa.me/85284890232"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-black hover:underline tracking-wider"
                    >
                      +852 8489 0232
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 tracking-wider mb-1">Workshop 地址</p>
                    <p className="text-sm text-black tracking-wider leading-relaxed">
                      荔枝角青山道688-690號<br />
                      嘉名工廠大廈B座10樓B室21號房
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      開放時間為每月特定日子，請提前預約
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 聯絡表單 */}
            <div>
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-sm font-medium tracking-widest mb-4">發送訊息</h2>
                  <div>
                    <label className="block text-xs text-gray-500 tracking-wider mb-2">姓名</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-gray-200 px-4 py-3 text-sm tracking-wide focus:border-black focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 tracking-wider mb-2">電子郵箱</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-gray-200 px-4 py-3 text-sm tracking-wide focus:border-black focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 tracking-wider mb-2">主題</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full border border-gray-200 px-4 py-3 text-sm tracking-wide focus:border-black focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 tracking-wider mb-2">訊息內容</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={5}
                      className="w-full border border-gray-200 px-4 py-3 text-sm tracking-wide focus:border-black focus:outline-none transition-colors resize-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-black text-white text-sm tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    發送
                  </button>
                </form>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-medium tracking-wider mb-2">訊息已送出</h3>
                  <p className="text-sm text-gray-500 tracking-wider">
                    我們會在 24 小時內回覆您
                  </p>
                </div>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}