"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Search, ShoppingBag, Package, User, X } from 'lucide-react';
import CartDrawer from './CartDrawer';
import SearchOverlay from './SearchOverlay';
import CartBadge from './CartBadge';

const navItems = [
  { label: '最新系列', href: '/products?filter=new' },
  { label: '所有商品', href: '/products' },
  { label: '品牌故事', href: '/about' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white flex items-center justify-between p-4 md:px-8 lg:px-12 border-b border-gray-100 h-16 text-black">
        
        {/* 左側：漢堡菜單（移動端）/ 導航連結（桌面端） */}
        <div className="flex items-center relative z-10">
          <button 
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="p-2 -ml-2 text-black hover:text-gray-700 transition-colors md:hidden"
            aria-label="開啟選單"
          >
            <Menu className="w-6 h-6" strokeWidth={1.5} />
          </button>
          
          <nav className="hidden md:flex space-x-8 text-sm font-medium tracking-widest text-black">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="hover:text-gray-700 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* 中間：Logo（絕對定位居中） */}
        <Link 
          href="/"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl md:text-3xl font-bold tracking-widest m-0 text-black"
          style={{ 
            fontFamily: '"Montserrat", serif',
            letterSpacing: '0.15em'
          }}
        >
          O'CHIU
        </Link>
        
        {/* 右側：圖標區域 */}
        <div className="flex items-center gap-1 md:gap-4 -mr-2 relative z-10">
          {/* 搜尋：全平台顯示 */}
          <button
            type="button"
            className="p-2 text-black hover:text-gray-700 transition-colors cursor-pointer"
            onClick={() => setIsSearchOpen(true)}
            aria-label="搜尋"
          >
            <Search className="w-6 h-6 md:w-5 md:h-5" strokeWidth={1.5} />
          </button>

          {/* 我的帳戶：僅桌面端顯示（移動端已在抽屜菜單中） */}
          <Link
            href="/account"
            className="hidden md:block p-2 text-black hover:text-gray-700 transition-colors"
            title="我的帳戶"
          >
            <User className="w-5 h-5" strokeWidth={1.5} />
          </Link>

          {/* 訂單追蹤：僅桌面端顯示（移動端已在抽屜菜單中） */}
          <Link
            href="/orders"
            className="hidden md:block p-2 text-black hover:text-gray-700 transition-colors"
            title="訂單追蹤"
          >
            <Package className="w-5 h-5" strokeWidth={1.5} />
          </Link>

          {/* 購物車：全平台顯示 */}
          <button 
            type="button"
            className="p-2 text-black hover:text-gray-700 transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              setIsCartOpen(true);
            }}
            aria-label="購物車"
          >
            <ShoppingBag className="w-6 h-6 md:w-5 md:h-5" strokeWidth={1.5} />
            <CartBadge />
          </button>
        </div>
      </header>

      {/* 移動端抽屜菜單 */}
      <div
        className={`fixed inset-0 z-[90] md:hidden transition-visibility ${
          isMenuOpen ? 'visible' : 'invisible'
        }`}
        aria-hidden={!isMenuOpen}
      >
        {/* 半透明遮罩層 */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMenu}
          aria-label="關閉選單"
        />

        {/* 左側滑入抽屜面板 */}
        <div
          className={`absolute top-0 left-0 h-full w-72 max-w-[80vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* 抽屜頂部 */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <span
              className="text-lg font-bold tracking-widest text-black"
              style={{ fontFamily: '"Montserrat", serif', letterSpacing: '0.15em' }}
            >
              O'CHIU
            </span>
            <button
              type="button"
              onClick={closeMenu}
              className="p-2 -mr-2 text-gray-400 hover:text-black transition-colors"
              aria-label="關閉選單"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* 導航連結 */}
          <nav className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block px-3 py-4 text-base font-medium tracking-wide text-black hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="my-6 border-t border-gray-100" />

            {/* 次要連結（移動端專屬入口） */}
            <div className="space-y-1">
              <Link
                href="/account"
                className="flex items-center gap-3 px-3 py-4 text-sm tracking-wide text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                onClick={closeMenu}
              >
                <User className="w-4 h-4" strokeWidth={1.5} />
                我的帳戶
              </Link>
              <Link
                href="/orders"
                className="flex items-center gap-3 px-3 py-4 text-sm tracking-wide text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                onClick={closeMenu}
              >
                <Package className="w-4 h-4" strokeWidth={1.5} />
                訂單查詢
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-3 px-3 py-4 text-sm tracking-wide text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                onClick={closeMenu}
              >
                <User className="w-4 h-4" strokeWidth={1.5} />
                註冊帳戶
              </Link>
            </div>
          </nav>

          {/* 抽屜底部 */}
          <div className="px-6 py-4 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 tracking-wider text-center">
              © 2026 O'CHIU. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}