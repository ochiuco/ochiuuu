"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag, Check, X } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';
import useCartStore from '@/store/useCartStore';
import useAuthStore from '@/store/useAuthStore';

export interface Product {
  id: number | string;
  name: string;
  price: string;
  originalPrice?: string;
  image: string;
  hoverImage?: string;
  tag?: string | null;
  colors?: { name: string; value: string }[];
  sizes?: string[];
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedColor, setSelectedColor] = useState<number>(0);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const addItem = useCartStore((state) => state.addItem);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const email = useAuthStore((s) => s.email);
  const wishlistIds = useAuthStore((s) => s.wishlistIds);
  const addWishlistId = useAuthStore((s) => s.addWishlistId);
  const removeWishlistId = useAuthStore((s) => s.removeWishlistId);

  const productId = String(product.id);
  const isWishlisted = wishlistIds.includes(productId);

  const hasQuickInfo = product.colors && product.colors.length > 0 && product.sizes && product.sizes.length > 0;

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setHovered(true);
  };

  const handleMouseLeave = () => {
    leaveTimerRef.current = setTimeout(() => {
      setHovered(false);
      setShowQuickAdd(false);
    }, 100);
  };

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedColor(0);
    setShowQuickAdd(true);
  };

  const handleColorSelect = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedColor(idx);
  };

  const handleSizeSelect = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.colors || !product.sizes) return;

    addItem({
      id: product.id,
      name: product.name,
      color: product.colors[selectedColor].name,
      size: size,
      price: parseInt(product.price.replace(/[^0-9]/g, '')),
      quantity: 1,
      image: product.image,
    });

    setShowQuickAdd(false);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 2000);
  };

  const handleClosePanel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickAdd(false);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn || !email) {
      router.push('/register');
      return;
    }

    if (wishlistLoading) return;
    setWishlistLoading(true);

    try {
      if (isWishlisted) {
        removeWishlistId(productId);
        const res = await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, productId }),
        });
        if (!res.ok) {
          // revert
          addWishlistId(productId);
        }
      } else {
        addWishlistId(productId);
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, productId }),
        });
        if (!res.ok) {
          // revert
          removeWishlistId(productId);
        }
      }
    } catch {
      // revert on network error
      if (isWishlisted) {
        addWishlistId(productId);
      } else {
        removeWishlistId(productId);
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <FadeIn delay={index * 100}>
      <Link href={`/product/${product.id}`} className="group block">
        <div
          className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-4 rounded-sm"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            className={`object-cover transition-all duration-700 ${
              hovered && product.hoverImage ? 'opacity-0' : 'opacity-100'
            } ${hovered ? 'scale-105' : 'scale-100'}`}
          />
          {product.hoverImage && (
            <Image
              src={product.hoverImage}
              alt={`${product.name} 細節`}
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className={`object-cover transition-opacity duration-700 ${
                hovered ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          {product.tag && (
            <span className="absolute top-3 left-3 px-3 py-1 bg-black text-white text-[10px] tracking-widest z-10">
              {product.tag}
            </span>
          )}

          {/* 收藏按鈕 */}
          <button
            type="button"
            className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full transition-all duration-300 z-10 ${
              hovered || isWishlisted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            } ${wishlistLoading ? 'pointer-events-none' : ''}`}
            onClick={handleWishlistToggle}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600'
              } ${wishlistLoading ? 'animate-pulse' : ''}`}
            />
          </button>

          {/* 成功提示 */}
          {addedSuccess && (
            <div className="absolute bottom-0 left-0 right-0 bg-green-600 py-3 text-center z-20">
              <span className="text-white text-xs tracking-widest flex items-center justify-center gap-2">
                <Check className="w-3.5 h-3.5" />
                已加入購物袋
              </span>
            </div>
          )}

          {/* 顏色 + 尺碼選擇面板 */}
          {showQuickAdd && !addedSuccess && hasQuickInfo && (
            <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-20 border-t border-gray-100">
              <div className="px-3 pt-3 pb-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-widest text-gray-500">
                    快速選購
                  </span>
                  <button
                    type="button"
                    onClick={handleClosePanel}
                    className="p-0.5 text-gray-400 hover:text-black transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <span className="text-[10px] tracking-wider text-gray-400 block mb-1.5">
                    顏色：{product.colors![selectedColor].name}
                  </span>
                  <div className="flex items-center gap-2">
                    {product.colors!.map((color, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => handleColorSelect(e, idx)}
                        className={`w-5 h-5 rounded-full transition-all ${
                          selectedColor === idx
                            ? 'ring-2 ring-black ring-offset-1'
                            : 'ring-1 ring-gray-200 hover:ring-gray-400'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] tracking-wider text-gray-400 block mb-1.5">
                    尺碼
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.sizes!.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={(e) => handleSizeSelect(e, size)}
                        className="min-w-[32px] h-7 px-2 text-[11px] tracking-wider border border-gray-200 text-gray-700 hover:border-black hover:bg-black hover:text-white transition-all"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 快速加入按鈕 */}
          {!showQuickAdd && !addedSuccess && hasQuickInfo && (
            <div
              className={`absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm py-3 text-center transition-all duration-300 z-10 ${
                hovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              }`}
            >
              <button
                type="button"
                className="text-white text-xs tracking-widest flex items-center justify-center gap-2 w-full"
                onClick={handleQuickAddClick}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                快速加入購物袋
              </button>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <h3 className="text-sm tracking-wide text-gray-800 group-hover:text-black transition-colors line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-medium tracking-wider"
              style={{ fontFamily: '"Montserrat", sans-serif' }}
            >
              {product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {product.originalPrice}
              </span>
            )}
          </div>
        </div>
      </Link>
    </FadeIn>
  );
}