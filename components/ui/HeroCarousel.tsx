"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const heroSlides = [
  {
    image: "/images/ui/Home1_NEW.JPG",
    subtitle: "2026 AUTUMN",
    title: "秋日新品\n已上架",
    cta: "探索系列",
    link: "/products?filter=new",
  },
  {
    image: "/images/ui/Home2.JPG",
    subtitle: "ESSENTIALS",
    title: "回歸本質\n經典重塑",
    cta: "查看全部",
    link: "/products",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % heroSlides.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + heroSlides.length) % heroSlides.length);
  }, [current, goTo]);

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next]);

  return (
    <section className="relative w-full px-6 md:px-12 lg:px-20 py-4 overflow-hidden">
      <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === current ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-105 invisible'
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
        ))}

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center text-white px-4 max-w-3xl">
            <p
              className={`text-xs tracking-[0.5em] mb-6 transition-all duration-700 delay-200 ${
                !isTransitioning ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ fontFamily: '"Montserrat", sans-serif' }}
            >
              {heroSlides[current].subtitle}
            </p>
            <h1
              className={`text-4xl md:text-6xl lg:text-7xl font-medium leading-tight whitespace-pre-line mb-8 transition-all duration-700 delay-300 ${
                !isTransitioning ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {heroSlides[current].title}
            </h1>
            <Link
              href={heroSlides[current].link}
              className={`inline-flex items-center gap-2 px-8 py-4 border border-white text-sm tracking-widest hover:bg-white hover:text-black transition-all duration-500 delay-500 ${
                !isTransitioning ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {heroSlides[current].cta}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={prev}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/60 hover:text-white transition-colors z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          type="button"
          onClick={next}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white/60 hover:text-white transition-colors z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              className="group flex items-center"
            >
              <div
                className={`h-0.5 transition-all duration-500 ${
                  index === current ? 'w-8 bg-white' : 'w-4 bg-white/30 group-hover:bg-white/60'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}