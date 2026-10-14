"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';

export default function BrandBanner() {
  return (
    <section className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
      <Image
        src="/images/ui/Home_A.jpeg"
        alt="O'CHIU Brand"
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/40" />
      <FadeIn>
        <div className="relative z-10 text-center text-white px-4 max-w-2xl">
          <p
            className="text-xs tracking-[0.5em] text-white/60 mb-6"
            style={{ fontFamily: '"Montserrat", sans-serif' }}
          >
            OUR PHILOSOPHY
          </p>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-medium leading-relaxed italic mb-8" style={{ fontFamily: '"Montserrat", serif' }}>
            Just a mood in the shop.
          </h2>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-8 py-3 border border-white/60 text-sm tracking-widest hover:bg-white hover:text-black transition-all duration-500"
          >
            了解品牌故事
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}