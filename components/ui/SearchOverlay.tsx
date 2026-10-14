"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, ArrowRight, Clock, TrendingUp } from 'lucide-react';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProductResult {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  category: string;
  images: string[];
  isBestSeller: boolean;
  isNew: boolean;
}

const popularSearches = [
  "T-Shirt",
  "衛衣",
  "長褲",
  "外套",
  "新品",
];

const recentSearches = [
  "經典純棉",
  "寬鬆版型",
  "黑色上衣",
];

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductResult[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 拉取精選商品（isBestSeller=true），面板打開時只加載一次
  useEffect(() => {
    if (!isOpen || featuredProducts.length > 0) return;
    fetch('/api/products?featured=true')
      .then((res) => res.json())
      .then((data) => {
        const items: ProductResult[] = (data.products ?? []).slice(0, 4);
        setFeaturedProducts(items);
      })
      .catch(() => {});
  }, [isOpen, featuredProducts.length]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
      setHasSearched(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim().length > 0) {
      setHasSearched(true);
      fetch(`/api/products?search=${encodeURIComponent(searchQuery.trim())}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.products ?? []);
        })
        .catch(() => setResults([]));
    } else {
      setHasSearched(false);
      setResults([]);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    handleSearch(tag);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* 搜索面板 */}
      <div className="absolute top-0 left-0 right-0 bg-white shadow-xl max-h-screen overflow-y-auto animate-slideDown">
        {/* 搜索欄 */}
        <div className="border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
            <form onSubmit={handleSubmit} className="flex items-center gap-4">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" strokeWidth={1.5} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="搜尋商品..."
                className="flex-1 text-lg md:text-xl tracking-wide bg-transparent outline-none placeholder:text-gray-300"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => handleSearch('')}
                  className="p-1 text-gray-300 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 -mr-2 text-gray-400 hover:text-black transition-colors"
              >
                <span className="text-xs tracking-widest hidden sm:inline">ESC</span>
                <X className="w-5 h-5 sm:hidden" />
              </button>
            </form>
          </div>
        </div>

        {/* 內容區 */}
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
          {!hasSearched ? (
            /* 預設狀態：推薦搜索 */
            <div className="space-y-10">
              {/* 最近搜索 */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <Clock className="w-4 h-4 text-gray-300" />
                    <h3
                      className="text-xs tracking-[0.3em] text-gray-400"
                      style={{ fontFamily: '"Montserrat", sans-serif' }}
                    >
                      RECENT
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handleTagClick(term)}
                        className="px-4 py-2 border border-gray-200 text-sm tracking-wider text-gray-600 hover:border-black hover:text-black transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 熱門搜索 */}
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp className="w-4 h-4 text-gray-300" />
                  <h3
                    className="text-xs tracking-[0.3em] text-gray-400"
                    style={{ fontFamily: '"Montserrat", sans-serif' }}
                  >
                    TRENDING
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleTagClick(term)}
                      className="px-4 py-2 bg-gray-50 text-sm tracking-wider text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* 推薦商品（動態讀取 isBestSeller=true 的真實商品） */}
              {featuredProducts.length > 0 && (
                <div>
                  <h3
                    className="text-xs tracking-[0.3em] text-gray-400 mb-5"
                    style={{ fontFamily: '"Montserrat", sans-serif' }}
                  >
                    POPULAR ITEMS
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {featuredProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={onClose}
                        className="group block"
                      >
                        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-3">
                          <Image
                            src={product.images?.[0] || '/images/testing1.jpeg'}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                        <h4 className="text-sm tracking-wide text-gray-800 group-hover:text-black transition-colors line-clamp-1">
                          {product.name}
                        </h4>
                        <p
                          className="text-sm text-gray-500 mt-1"
                          style={{ fontFamily: '"Montserrat", sans-serif' }}
                        >
                          {product.priceDisplay}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : results.length > 0 ? (
            /* 有搜索結果 */
            <div>
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm text-gray-500 tracking-wider">
                  找到 <span className="text-black font-medium">{results.length}</span> 個相關商品
                </p>
                <Link
                  href={`/products?search=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="flex items-center gap-2 text-xs tracking-widest text-gray-500 hover:text-black transition-colors"
                >
                  查看全部結果
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    onClick={onClose}
                    className="group block"
                  >
                    <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-3">
                      <Image
                        src={product.images?.[0] || '/images/testing1.jpeg'}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <p
                        className="text-[10px] tracking-widest text-gray-400"
                        style={{ fontFamily: '"Montserrat", sans-serif' }}
                      >
                        {product.category}
                      </p>
                      <h4 className="text-sm tracking-wide text-gray-800 group-hover:text-black transition-colors line-clamp-1">
                        {product.name}
                      </h4>
                      <p
                        className="text-sm font-medium tracking-wider"
                        style={{ fontFamily: '"Montserrat", sans-serif' }}
                      >
                        {product.priceDisplay}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            /* 無搜索結果 */
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-gray-200 mx-auto mb-6" strokeWidth={1} />
              <h3 className="text-lg font-medium tracking-wider mb-3">
                未找到相關商品
              </h3>
              <p className="text-sm text-gray-400 tracking-wider mb-8">
                「{query}」沒有匹配的結果，試試其他關鍵詞吧
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleTagClick(term)}
                    className="px-4 py-2 border border-gray-200 text-sm tracking-wider text-gray-500 hover:border-black hover:text-black transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
