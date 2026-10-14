// app/product/[id]/page.tsx
"use client";

import useCartStore from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Heart,
  Share2,
  Minus,
  Plus,
  ShoppingBag,
  Check,
  ChevronDown,
  X,
} from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';
import { fetchProduct, checkStock } from '@/lib/api';

/* ====== 尺碼指南類型定義 ====== */
interface SizeGuideData {
  headers: string[];
  rows: string[][];
  notes?: string[];
}

const defaultSizeGuide: SizeGuideData = {
  headers: ['尺碼', '胸圍 (cm)', '肩寬 (cm)', '衣長 (cm)'],
  rows: [
    ['XS', '88', '42', '64'],
    ['S', '92', '44', '66'],
    ['M', '96', '46', '68'],
    ['L', '100', '48', '70'],
    ['XL', '104', '50', '72'],
  ],
  notes: [
    '以上尺寸為平鋪測量，可能存在 1-2cm 誤差',
    '模特身高 175cm，體重 60kg，穿著 M 碼',
    '如在兩個尺碼之間，建議選擇較大的尺碼',
  ],
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { isLoggedIn, email, wishlistIds, addWishlistId, removeWishlistId, hydrate, fetchWishlist } = useAuthStore();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("details");
  const [stockInfo, setStockInfo] = useState<{ inStock: boolean; quantity: number } | null>(null);
  const [hemming, setHemming] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  /* ====== 模塊2：改用 hemService 字段替代 category 硬編碼 ====== */
  /* Bug 2 修復：增加兼容處理，防止類型不匹配導致渲染失敗 */
  const showHemService = useMemo(() => {
    if (!product) return false;
    const val = product.hemService;
    // 兼容 boolean true、字符串 "true"、數字 1 等情況
    if (val === true || val === "true" || val === 1) return true;
    return false;
  }, [product]);

  const isWishlisted = wishlistIds.includes(id);

  // Hydrate auth state
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Fetch wishlist after hydration
  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlist();
    }
  }, [isLoggedIn, fetchWishlist]);

  // 從 API 獲取商品
  useEffect(() => {
    setLoading(true);
    fetchProduct(id)
      .then((data) => {
        setProduct(data);
      })
      .catch(() => {
        router.push('/products');
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  /* ====== 模塊1：顏色-主圖聯動 ====== */
  // 根據選中顏色獲取當前應顯示的圖片列表
  const currentImages = useMemo(() => {
    if (!product) return [];

    const colors = product.colors as { name: string; value: string }[];
    const colorImages = product.colorImages as Record<string, string[]> | null;

    // 使用 colorImages 中與當前顏色 name 對應的圖片組
    if (colorImages && colors[selectedColor]) {
      const name = colors[selectedColor].name;
      if (name && colorImages[name] && colorImages[name].length > 0) {
        return colorImages[name];
      }
    }

    // fallback：使用商品通用圖片
    return product.images || [];
  }, [product, selectedColor]);

  // 切換顏色時自動重置到第一張圖（確保主圖同步）
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedColor]);

  /* ====== 模塊3：解析商品專屬尺碼指南 ====== */
  const sizeGuide = useMemo<SizeGuideData>(() => {
    if (product?.sizeGuide && typeof product.sizeGuide === 'object') {
      const sg = product.sizeGuide as any;
      if (Array.isArray(sg.headers) && Array.isArray(sg.rows)) {
        return {
          headers: sg.headers,
          rows: sg.rows,
          notes: Array.isArray(sg.notes) ? sg.notes : undefined,
        };
      }
    }
    return defaultSizeGuide;
  }, [product]);

  // 當選擇顏色/尺寸變化時，檢查庫存
  useEffect(() => {
    if (!product) return;
    const colors = product.colors as { name: string; value: string }[];
    if (colors[selectedColor] && selectedSize !== null && product.sizes[selectedSize]) {
      checkStock(product.id, colors[selectedColor].name, product.sizes[selectedSize])
        .then(setStockInfo)
        .catch(() => setStockInfo(null));
    }
  }, [product, selectedColor, selectedSize]);

  const handleAddToCart = () => {
    if (!product || selectedSize === null) return;
    if (stockInfo && !stockInfo.inStock) return;

    const colors = product.colors as { name: string; value: string }[];

    /* 模塊2：購物車安全校驗，只有 hemService === true 才附加費用 */
    addItem({
      id: product.id,
      name: product.name,
      color: colors[selectedColor].name,
      size: product.sizes[selectedSize],
      price: product.price / 100,
      quantity: quantity,
      image: currentImages[0] || product.images[0],
      hemming: showHemService ? hemming : false,
      hemmingFee: showHemService && hemming ? 15 : 0,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 4000);
  };

  const handleWishlistToggle = async () => {
    if (!isLoggedIn) {
      router.push('/register');
      return;
    }

    try {
      if (isWishlisted) {
        removeWishlistId(id);
        await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, productId: id }),
        });
      } else {
        addWishlistId(id);
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, productId: id }),
        });
      }
    } catch {
      if (isWishlisted) {
        addWishlistId(id);
      } else {
        removeWishlistId(id);
      }
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Loading 狀態
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const colors = product.colors as { name: string; value: string }[];
  const priceDisplay = product.priceDisplay || `HK$ ${product.price / 100}`;
  const originalPriceDisplay = product.originalPriceDisplay || null;
  const unitPrice = product.price / 100 + (showHemService && hemming ? 15 : 0);

  return (
    <div className="min-h-screen bg-white">
      {/* 頂部導航欄 */}
      <div className="sticky top-16 md:top-16 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-3 flex items-center justify-between">
          {/* Bug 1 修復：使用 router.back() 替代硬編碼 Link，保留分類狀態與滾動位置 */}
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-black transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="tracking-wider">返回商品列表</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleWishlistToggle}
              className={`p-2 transition-colors ${isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-black'}`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-black transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 主內容 */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

          {/* 左側：圖片區域 */}
          <div className="space-y-4">
            {product.tag && (
              <span className="inline-block px-3 py-1 text-xs tracking-widest bg-black text-white">
                {product.tag}
              </span>
            )}

            <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
              <img
                src={currentImages[selectedImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-500"
              />
            </div>

            <div
              ref={imageContainerRef}
              className="flex gap-3 overflow-x-auto hide-scrollbar"
            >
              {currentImages.map((img: string, index: number) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-24 md:w-24 md:h-32 bg-gray-100 overflow-hidden transition-all ${
                    selectedImage === index
                      ? 'ring-2 ring-black ring-offset-2'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 右側：商品資訊 */}
          <div className="lg:sticky lg:top-36 lg:self-start space-y-8">
            <FadeIn>
              <div className="space-y-3">
                <h1 className="text-2xl md:text-3xl font-medium tracking-wide">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3">
                  <span className="text-xl md:text-2xl tracking-wider">
                    {priceDisplay}
                  </span>
                  {originalPriceDisplay && (
                    <span className="text-base text-gray-400 line-through">
                      {originalPriceDisplay}
                    </span>
                  )}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={100}>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </FadeIn>

            {/* ====== 模塊1：顏色選擇（點擊自動切換主圖） ====== */}
            <FadeIn delay={200}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm tracking-wider">
                    顏色：{colors[selectedColor]?.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {colors.map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelectedColor(index);
                        /* 切換顏色時重置尺碼與庫存狀態 */
                        setSelectedSize(null);
                        setStockInfo(null);
                        /* selectedImage 由 useEffect 自動重置為 0，主圖自動切換 */
                      }}
                      className={`w-8 h-8 rounded-full transition-all ${
                        selectedColor === index
                          ? 'ring-2 ring-black ring-offset-2'
                          : 'ring-1 ring-gray-200 hover:ring-gray-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={300}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm tracking-wider">
                    尺碼{selectedSize !== null ? `：${product.sizes[selectedSize]}` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(true)}
                    className="text-xs text-gray-500 underline hover:text-black transition-colors tracking-wider"
                  >
                    尺碼指南
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string, index: number) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(index)}
                      className={`min-w-12 h-10 px-4 text-sm tracking-wider border transition-all ${
                        selectedSize === index
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 text-gray-700 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {selectedSize === null && (
                  <p className="text-xs text-amber-600 tracking-wider">請選擇尺碼</p>
                )}
                {stockInfo && !stockInfo.inStock && selectedSize !== null && (
                  <p className="text-xs text-red-600 tracking-wider">此規格已售罄</p>
                )}
                {stockInfo && stockInfo.inStock && stockInfo.quantity <= 5 && selectedSize !== null && (
                  <p className="text-xs text-amber-600 tracking-wider">僅剩 {stockInfo.quantity} 件</p>
                )}
              </div>
            </FadeIn>

            {/* ====== 模塊2：修褲腳選項 — 嚴格校驗 product.hemService ====== */}
            {showHemService && (
              <FadeIn delay={350}>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <button
                      type="button"
                      onClick={() => setHemming(!hemming)}
                      className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        hemming ? 'bg-black border-black' : 'border-gray-300 group-hover:border-gray-500'
                      }`}
                    >
                      {hemming && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className="text-sm tracking-wider">
                      修褲腳 <span className="text-gray-500">(+HK$ 15)</span>
                    </span>
                  </label>
                  {hemming && (
                    <p className="text-xs text-gray-500 ml-8 tracking-wider">
                      下單後客服會聯絡您確認褲長，修改後不支援換貨
                    </p>
                  )}
                </div>
              </FadeIn>
            )}

            <FadeIn delay={400}>
              <div className="space-y-3">
                <span className="text-sm tracking-wider">數量</span>
                <div className="flex items-center border border-gray-200 w-fit">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center text-sm border-l border-r border-gray-200">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {showHemService && hemming && (
                  <p className="text-xs text-gray-500 tracking-wider">
                    單價：HK$ {unitPrice}（含修褲腳）
                  </p>
                )}
              </div>
            </FadeIn>

            <FadeIn delay={500}>
              <div className="space-y-3">
                {!addedToCart ? (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={selectedSize === null || (stockInfo !== null && !stockInfo.inStock)}
                    className={`w-full h-14 flex items-center justify-center gap-3 text-sm tracking-[0.2em] transition-all ${
                      selectedSize === null || (stockInfo !== null && !stockInfo.inStock)
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-black text-white hover:bg-gray-800 active:scale-[0.98]'
                    }`}
                  >
                    <ShoppingBag className="w-4.5 h-4.5" />
                    加入購物袋
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="w-full h-14 flex items-center justify-center gap-3 bg-green-600 text-white text-sm tracking-[0.2em]">
                      <Check className="w-4.5 h-4.5" />
                      已加入購物袋
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setAddedToCart(false)}
                        className="flex-1 h-12 border border-gray-200 text-sm tracking-wider text-gray-600 hover:border-black hover:text-black transition-colors"
                      >
                        繼續購物
                      </button>
                      <Link
                        href="/checkout"
                        className="flex-1 h-12 flex items-center justify-center bg-black text-white text-sm tracking-wider hover:bg-gray-800 transition-colors"
                      >
                        前往結帳
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </FadeIn>

            {/* 摺疊面板 */}
            <div className="divide-y divide-gray-100">
              {product.details && product.details.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSection("details")}
                    className="w-full flex items-center justify-between py-5 text-sm tracking-wider text-left"
                  >
                    <span>商品詳情</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        expandedSection === "details" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedSection === "details" && (
                    <div className="pb-5 space-y-2">
                      {product.details.map((detail: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {product.material && (
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSection("material")}
                    className="w-full flex items-center justify-between py-5 text-sm tracking-wider text-left"
                  >
                    <span>材質成分</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        expandedSection === "material" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedSection === "material" && (
                    <div className="pb-5">
                      <p className="text-sm text-gray-600">{product.material}</p>
                    </div>
                  )}
                </div>
              )}

              {product.care && product.care.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSection("care")}
                    className="w-full flex items-center justify-between py-5 text-sm tracking-wider text-left"
                  >
                    <span>洗滌保養</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        expandedSection === "care" ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedSection === "care" && (
                    <div className="pb-5 space-y-2">
                      {product.care.map((item: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ====== 模塊3：尺碼指南彈窗 — 動態讀取 product.sizeGuide，否則 fallback ====== */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowSizeGuide(false)}
          />
          <div className="relative bg-white w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-medium tracking-wider">尺碼指南</h3>
              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                className="p-1 text-gray-400 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    {sizeGuide.headers.map((header, idx) => (
                      <th
                        key={idx}
                        className={`pb-3 text-xs tracking-wider text-gray-500 font-normal ${
                          idx === 0 ? 'text-left' : 'text-center'
                        }`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sizeGuide.rows.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className={`py-3 ${
                            cellIdx === 0 ? 'font-medium' : 'text-center text-gray-600'
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {sizeGuide.notes && sizeGuide.notes.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 space-y-2">
                  {sizeGuide.notes.map((note, idx) => (
                    <p key={idx} className="text-xs text-gray-500 tracking-wider">
                      • {note}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}