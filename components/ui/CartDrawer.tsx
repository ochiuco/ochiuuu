// components/ui/CartDrawer.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import useCartStore from '@/store/useCartStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();

  const subtotal = getSubtotal();

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            <h2 className="text-lg font-medium tracking-wider">購物袋</h2>
            <span className="text-sm text-gray-400">({items.length})</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-black transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-12 h-12 text-gray-200 mb-4" strokeWidth={1} />
              <p className="text-sm text-gray-400 tracking-wider">購物袋是空的</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 px-8 py-3 border border-gray-200 text-sm tracking-widest hover:border-black transition-colors"
              >
                繼續購物
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => {
                const itemTotal = (item.price + (item.hemming ? (item.hemmingFee || 15) : 0)) * item.quantity;
                return (
                  <div key={`${item.id}-${item.color}-${item.size}-${item.hemming ? 'h' : ''}`} className="flex gap-4">
                    <div className="w-20 h-24 bg-gray-100 flex-shrink-0 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-medium tracking-wider">{item.name}</h3>
                        <p className="text-xs text-gray-400 mt-1 tracking-wider">
                          {item.color} / {item.size}
                        </p>
                        {item.hemming && (
                          <p className="text-xs text-gray-500 mt-0.5 tracking-wider">
                            + 修褲腳 HK$ 15
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-200">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 h-7 flex items-center justify-center text-xs border-l border-r border-gray-200">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-sm tracking-wider">HK$ {itemTotal}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id, item.color, item.size)}
                      className="self-start p-1 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 tracking-wider">小計</span>
              <span className="text-lg font-medium tracking-wider">HK$ {subtotal}</span>
            </div>

            <p className="text-xs text-gray-400 tracking-wider">
              運費將在結帳時計算
            </p>

            <button
              type="button"
              onClick={handleCheckout}
              className="w-full h-12 bg-black text-white text-sm tracking-[0.2em] hover:bg-gray-800 active:scale-[0.98] transition-all"
            >
              前往結帳
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full h-10 text-sm tracking-wider text-gray-500 hover:text-black transition-colors"
            >
              繼續購物
            </button>
          </div>
        )}
      </div>
    </div>
  );
}