"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FadeIn from '@/components/ui/FadeIn';

interface CategoryDef {
  name: string;
  nameEn: string;
  image: string;
  slug: string;
  href: string;
}

const categoryDefs: CategoryDef[] = [
  { name: "上衣", nameEn: "TOPS", image: "/images/ui/Categories_T.JPG", slug: "tops", href: "/products?category=tops" },
  { name: "下裝", nameEn: "BOTTOMS", image: "/images/ui/Categories_B.JPG", slug: "bottoms", href: "/products?category=bottoms" },
  { name: "外套", nameEn: "OUTERWEAR", image: "/images/ui/Categories_O.JPG", slug: "outerwear", href: "/products?category=outerwear" },
  { name: "配飾", nameEn: "ACCESSORIES", image: "/images/ui/Categories_A.jpeg", slug: "accessories", href: "/products?category=accessories" },
];

export default function CategoryGrid() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch('/api/categories/counts');
        if (res.ok) {
          const data = await res.json();
          setCounts(data.counts || {});
        }
      } catch (err) {
        console.error('Failed to fetch category counts:', err);
      }
    }
    fetchCounts();
  }, []);

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <FadeIn>
          <div className="text-center mb-12 md:mb-16">
            <p
              className="text-xs tracking-[0.4em] text-gray-400 mb-4"
              style={{ fontFamily: '"Montserrat", sans-serif' }}
            >
              CATEGORIES
            </p>
            <h2 className="text-2xl md:text-3xl font-medium">
              選購分類
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categoryDefs.map((cat, index) => {
            const count = counts[cat.slug] ?? 0;
            return (
              <FadeIn key={cat.name} delay={index * 100}>
                <Link href={cat.href} className="group relative block aspect-[3/4] overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <p
                      className="text-[10px] tracking-[0.4em] text-white/60 mb-2"
                      style={{ fontFamily: '"Montserrat", sans-serif' }}
                    >
                      {cat.nameEn}
                    </p>
                    <h3 className="text-lg md:text-xl tracking-wider font-medium">{cat.name}</h3>
                    <p className="text-xs text-white/60 mt-2">{count} 件商品</p>
                  </div>
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}