"use client";

import React from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';

const instagramPosts = [
  "/images/ui/ig1.JPG",
  "/images/ui/ig2.JPG",
  "/images/ui/ig3.JPG",
  "/images/ui/ig4.JPG",
  "/images/ui/ig5.JPG",
  "/images/ui/ig6.JPG",
];

export default function InstagramFeed() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <FadeIn>
          <div className="text-center mb-12">
            <p
              className="text-xs tracking-[0.4em] text-gray-400 mb-4"
              style={{ fontFamily: '"Montserrat", sans-serif' }}
            >
              @OCHIU.CO
            </p>
            <h2 className="text-2xl md:text-3xl font-medium">穿搭靈感</h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-1 md:gap-2">
          {instagramPosts.map((img, index) => (
            <FadeIn key={index} delay={index * 80}>
              <a
                href="https://instagram.com/ochiu.co"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden block"
              >
                <Image
                  src={img}
                  alt={`Instagram ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 33vw, 16vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}