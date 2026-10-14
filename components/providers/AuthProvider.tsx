"use client";

import { useEffect } from 'react';
import useAuthStore from '@/store/useAuthStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const fetchWishlist = useAuthStore((s) => s.fetchWishlist);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlist();
    }
  }, [isLoggedIn, fetchWishlist]);

  return <>{children}</>;
}