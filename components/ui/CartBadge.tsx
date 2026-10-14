"use client";

import React, { useEffect, useState } from 'react';
import useCartStore from '@/store/useCartStore';

export default function CartBadge() {
  const items = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  if (count === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[10px] flex items-center justify-center rounded-full">
      {count > 9 ? '9+' : count}
    </span>
  );
}