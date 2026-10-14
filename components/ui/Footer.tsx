"use client";

import React from 'react';
import Link from 'next/link';
import { Mail, MapPin, MessageCircle } from 'lucide-react';

const footerLinks = {
  shop: [
    { label: "全部商品", href: "/products" },
    { label: "新品上架", href: "/products?filter=new" },
    { label: "上衣", href: "/products?category=tops" },
    { label: "下裝", href: "/products?category=bottoms" },
    { label: "外套", href: "/products?category=outerwear" },
    { label: "配飾", href: "/products?category=accessories" },
  ],
  about: [
    { label: "品牌故事", href: "/about" },
    { label: "聯繫我們", href: "/help/contact" },
  ],
  help: [
    { label: "配送說明", href: "/help/delivery" },
    { label: "退換政策", href: "/help/return-policy" },
    { label: "尺碼指南", href: "/help/size-guide" },
    { label: "常見問題", href: "/help/faq" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">

          <div className="col-span-2 md:col-span-1 space-y-6">
            <Link
              href="/"
              className="text-xl tracking-[0.3em] font-medium block"
              style={{ fontFamily: '"Montserrat", serif' }}
            >
              O'CHIU
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs italic">
              Just a mood in the shop.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/ochiu.co"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-gray-700 flex items-center justify-center hover:border-white hover:text-white text-gray-400 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a
                href="https://wa.me/85284890232"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-gray-700 flex items-center justify-center hover:border-white hover:text-white text-gray-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="mailto:ochiuuu@gmail.com"
                className="w-9 h-9 border border-gray-700 flex items-center justify-center hover:border-white hover:text-white text-gray-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>

            {/* Workshop 地址 */}
            <div className="pt-4 border-t border-gray-800">
              <div className="flex items-start gap-2 text-xs text-gray-500 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>荔枝角青山道688-690號嘉名工廠大廈B座10樓B室21號房</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs tracking-[0.3em] text-gray-400 uppercase" style={{ fontFamily: '"Montserrat", serif' }}>
              Shop
            </h4>
            <nav className="space-y-3">
              {footerLinks.shop.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-gray-400 hover:text-white transition-colors tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs tracking-[0.3em] text-gray-400 uppercase" style={{ fontFamily: '"Montserrat", serif' }}>
              About
            </h4>
            <nav className="space-y-3">
              {footerLinks.about.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-gray-400 hover:text-white transition-colors tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs tracking-[0.3em] text-gray-400 uppercase" style={{ fontFamily: '"Montserrat", serif' }}>
              Help
            </h4>
            <nav className="space-y-3">
              {footerLinks.help.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-gray-400 hover:text-white transition-colors tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <p className="text-xs text-gray-500 tracking-wider">
              © 2026 O'CHIU. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <Link href="/help/privacy" className="hover:text-white transition-colors tracking-wider">隱私政策</Link>
              <Link href="/help/terms" className="hover:text-white transition-colors tracking-wider">服務條款</Link>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="tracking-wider">Hong Kong</span>
              </div>
            </div>
          </div>
          <div className="text-center md:text-left">
            <p className="text-[10px] text-gray-600 leading-relaxed tracking-wider">
              本幫助中心內容受香港特別行政區法律管轄。O'CHIU 保留對以上條款及細則的最終解釋及修改權利。如有任何爭議，我們會以友好態度與您協商解決。
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}