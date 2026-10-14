// app/products/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ChevronDown, Grid3X3, LayoutGrid } from 'lucide-react';
import ProductCard, { Product } from '@/components/ui/ProductCard';
import FadeIn from '@/components/ui/FadeIn';
import { fetchProducts } from '@/lib/api';

const categories = [
  { key: "all", label: "全部" },
  { key: "tops", label: "上衣" },
  { key: "bottoms", label: "下裝" },
  { key: "outerwear", label: "外套" },
  { key: "accessories", label: "配飾" },
];

const sortOptions = [
  { key: "newest", label: "最新上架" },
  { key: "price-asc", label: "價格：低到高" },
  { key: "price-desc", label: "價格：高到低" },
  { key: "popular", label: "最受歡迎" },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const filter = searchParams.get('filter');

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("newest");
  const [showSort, setShowSort] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 3>(3);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 從 API 獲取商品
  useEffect(() => {
    setLoading(true);
    fetchProducts({
      category: activeCategory === 'all' ? undefined : activeCategory,
      tag: filter || undefined,
      sort: sortBy,
    })
      .then((data) => {
        // 將 API 數據映射為 ProductCard 需要的格式
        const mapped: Product[] = data.map((p: any) => ({
          id: p.id, // 注意：現在是 string (UUID)
          name: p.name,
          price: p.priceDisplay,
          originalPrice: p.originalPriceDisplay || undefined,
          image: p.images?.[0] || '/images/testing1.jpeg',
          hoverImage: p.images?.[1] || p.hoverImage || '/images/testing2.jpeg',
          tag: p.tag || null,
          colors: p.colors || [],
          sizes: p.sizes || [],  
        }));
        setProducts(mapped);
      })
      .catch((err) => {
        console.error('獲取商品失敗:', err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [activeCategory, sortBy, filter]);

  const getPageTitle = () => {
    if (filter === 'new') return '新品上架';
    if (filter === 'limited') return '限定系列';
    const cat = categories.find(c => c.key === activeCategory);
    return cat && cat.key !== 'all' ? cat.label : '全部商品';
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#FFF5EE] py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <FadeIn>
            <p className="text-xs tracking-[0.4em] text-gray-400 mb-4" style={{ fontFamily: '"Montserrat", sans-serif' }}>
              {filter === 'new' ? 'NEW ARRIVALS' : filter === 'limited' ? 'LIMITED EDITION' : 'ALL PRODUCTS'}
            </p>
            <h1 className="text-2xl md:text-4xl font-medium tracking-wider">{getPageTitle()}</h1>
            <p className="text-sm text-gray-500 mt-3">{products.length} 件商品</p>
          </FadeIn>
        </div>
      </div>

      <div className="sticky top-16 md:top-16 z-30 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
              {categories.map((cat) => (
                <button key={cat.key} type="button" onClick={() => setActiveCategory(cat.key)}
                  className={`px-4 py-2 text-xs tracking-widest whitespace-nowrap transition-all rounded-full ${activeCategory === cat.key ? 'bg-black text-white' : 'text-gray-500 hover:text-black hover:bg-gray-100'}`}>
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
              <div className="relative">
                <button type="button" onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-2 text-xs tracking-wider text-gray-500 hover:text-black transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">{sortOptions.find(s => s.key === sortBy)?.label}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showSort ? 'rotate-180' : ''}`} />
                </button>
                {showSort && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 shadow-lg py-2 w-40 z-20">
                      {sortOptions.map((option) => (
                        <button key={option.key} type="button" onClick={() => { setSortBy(option.key); setShowSort(false); }}
                          className={`block w-full text-left px-4 py-2.5 text-xs tracking-wider transition-colors ${sortBy === option.key ? 'text-black font-medium bg-gray-50' : 'text-gray-500 hover:text-black hover:bg-gray-50'}`}>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="hidden md:flex items-center gap-1 border-l border-gray-200 pl-3">
                <button type="button" onClick={() => setGridCols(2)}
                  className={`p-1.5 transition-colors ${gridCols === 2 ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => setGridCols(3)}
                  className={`p-1.5 transition-colors ${gridCols === 3 ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}>
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-gray-400 tracking-wider">此分類暫無商品</p>
          </div>
        ) : (
          <div className={`grid gap-4 md:gap-6 ${gridCols === 2 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3'}`}>
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ProductsContent />
    </Suspense>
  );
}