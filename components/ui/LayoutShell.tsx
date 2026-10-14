"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

const EXCLUDED_PATHS = ['/checkout'];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isExcluded = EXCLUDED_PATHS.some(path => pathname.startsWith(path));

  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}