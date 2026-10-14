"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronDown } from 'lucide-react';

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function FadeInSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${className} ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const values = [
  {
    number: "01",
    title: "誠實的面料",
    desc: "我們堅持天然纖維優先。每一批面料都經過手洗、日曬、反覆穿著的實測，確保你收到的衣服，和我們自己穿的一模一樣。",
  },
  {
    number: "02",
    title: "剛好的設計",
    desc: "不追潮流，不堆細節。只做穿上身後會忘記自己穿了什麼、卻覺得狀態很好的衣服。好的設計，是讓人感到自在。",
  },
  {
    number: "03",
    title: "負責的製造",
    desc: "與我們合作的每一間工廠，都經過實地探訪。我們相信善待製作衣服的人，才能做出善待穿衣服的人的產品。",
  },
  {
    number: "04",
    title: "長久的關係",
    desc: "我們不希望你買很多，而是希望你買到對的。我們深信，產品是為了服務人，而不是讓人去遷就產品。因此，若你在O'CHIU 中遇到任何問題、不滿，歡迎隨時聯絡我們。",
  },
];

export default function AboutPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-black -mt-16">

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-gray-200"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        >
          <div className="relative w-full" style={{ height: '120%' }}>
            <Image
              src="/images/ui/About_BG.JPG"
              alt="O'CHIU Brand"
              fill
              sizes="100vw"
              className="object-cover opacity-40"
              priority
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white" />

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <p
            className="text-xs tracking-[0.4em] text-gray-500 mb-6"
            style={{ fontFamily: '"Montserrat", serif' }}
          >
            OUR STORY
          </p>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-medium leading-tight mb-8"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            無定向，其實冇諗咁多
            <br />
            <span className="italic">Just a mood in the shop</span>
          </h1>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-xl mx-auto">
            O'CHIU 相信，衣服不需要張揚，卻可以給人力量。
            <br className="hidden md:block" />
            我們做的每一件，都希望成為你最自在的那一件。
          </p>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </section>


      {/* 圖文交錯區 */}
      <section className="pb-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">

          {/* Section 1: 品牌名字起源 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center mb-24 md:mb-32">
            <FadeInSection>
              <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                <Image
                  src="/images/ui/About_TN.JPEG"
                  alt="O'CHIU 成衣"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </FadeInSection>
            <FadeInSection delay={200}>
              <div className="lg:pl-4 space-y-6">
                <p
                  className="text-xs tracking-[0.3em] text-gray-400"
                  style={{ fontFamily: '"Montserrat", serif' }}
                >
                  THE NAME
                </p>
                <h3
                  className="text-2xl md:text-3xl font-medium leading-snug"
                  style={{ fontFamily: '"Playfair Display", serif' }}
                >
                  聚合與配對
                </h3>
                <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                  <p>
                    古書裡的「逑」，是聚合與配對。
                  </p>
                  <p>
                    順著讀音，揉進一抹法式的流動，就是 O'CHIU。坦白說，沒那麼多宏大的美學包袱。
                  </p>
                  <p>
                    只是覺得，把衣服規規矩矩地分類，實在太無聊。
                  </p>
                  <p>
                    隨性、精緻、或者帶點叛逆，從來都不該是單選題。
                  </p>
                  <p className="text-black font-medium">
                    摸到好看的、質感對的，憑直覺把它們揉在一起，本來就是一件很純粹的事。
                  </p>
                </div>
              </div>
            </FadeInSection>
          </div>

          {/* Section 2: 香港女生 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center mb-24 md:mb-32">
            <FadeInSection delay={200} className="order-2 lg:order-1">
              <div className="lg:pr-4 space-y-6">
                <p
                  className="text-xs tracking-[0.3em] text-gray-400"
                  style={{ fontFamily: '"Montserrat", serif' }}
                >
                  THE MUSE
                </p>
                <h3
                  className="text-2xl md:text-3xl font-medium leading-snug"
                  style={{ fontFamily: '"Playfair Display", serif' }}
                >
                  不只一副面孔
                </h3>
                <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                  <p>
                    步履匆匆地穿梭在城市之中，香港女生，從來不只有一副面孔。
                  </p>
                  <p>
                    剛在冷氣強勁的商廈裡展現俐落，一轉身，就能換上鬆弛的剪裁，踏著球鞋窩在街角喝一杯啤酒。
                  </p>
                  <p>
                    她們最迷人的地方，是任憑城市節奏再快，也能自如地收放自己的氣場。
                  </p>
                </div>
              </div>
            </FadeInSection>
            <FadeInSection className="order-1 lg:order-2">
              <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                <Image
                  src="/images/ui/About_TM.JPG"
                  alt="香港街頭"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </FadeInSection>
          </div>

          {/* Section 3: THE PHILOSOPHY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center mb-24 md:mb-32">
            <FadeInSection>
              <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                <Image
                  src="/images/ui/About_TP.JPG"
                  alt="O'CHIU 理念"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </FadeInSection>
            <FadeInSection delay={200}>
              <div className="lg:pl-4 space-y-6">
                <p
                  className="text-xs tracking-[0.3em] text-gray-400"
                  style={{ fontFamily: '"Montserrat", serif' }}
                >
                  THE PHILOSOPHY
                </p>
                <h3
                  className="text-2xl md:text-3xl font-medium leading-snug"
                  style={{ fontFamily: '"Playfair Display", serif' }}
                >
                  不跟隨潮流
                  <br />
                  <span className="italic">只跟隨生活</span>
                </h3>
                <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                  <p>
                    O'CHIU 這個名字，取自粵語「自在」的諧音。我們相信穿衣服這件事，不該是一種負擔或焦慮，而是一種日常的安心感。
                  </p>
                  <p>
                    所以我們不做限量、不搞飢餓營銷、不趕快時尚的節奏出新品。每一季只推出真正經過考驗的款式 — 那些我們自己會反覆穿、洗到起毛球也捨不得丟的衣服。
                  </p>
                  <p>
                    慢一點沒關係。做好一件，比做多十件重要。
                  </p>
                </div>
              </div>
            </FadeInSection>
          </div>

          {/* Section 4: 工廠與製造 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
            <FadeInSection delay={200} className="order-2 lg:order-1">
              <div className="lg:pr-4 space-y-6">
                <p
                  className="text-xs tracking-[0.3em] text-gray-400"
                  style={{ fontFamily: '"Montserrat", serif' }}
                >
                  THE CRAFT
                </p>
                <h3
                  className="text-2xl md:text-3xl font-medium leading-snug"
                  style={{ fontFamily: '"Playfair Display", serif' }}
                >
                  從工廠到鏡子前
                </h3>
                <div className="space-y-4 text-sm text-gray-500 leading-relaxed">
                  <p>
                    為了應對香港女生不同的生活需求，我們直接對接工廠，從設計到選料都全程參與。在成千上萬的料子裡精挑細選，只留下對的質感與觸感。
                  </p>
                  <p>
                    從工廠回到鏡子前，收錄回來的每一件款式，都必須經歷反覆的試穿。只要版型相差半公分、穿起來不夠完美，第一關就不要。
                  </p>
                  <p className="text-black font-medium">
                    衣服就是這樣，被一輪輪推翻，才變成今天掛在架上的成品。
                  </p>
                </div>
              </div>
            </FadeInSection>
            <FadeInSection className="order-1 lg:order-2">
              <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                <Image
                  src="/images/ui/About_TC.JPG"
                  alt="工廠製造"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* 品牌價值 */}
      <section className="py-24 md:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <FadeInSection>
            <div className="text-center mb-16 md:mb-20">
              <p
                className="text-xs tracking-[0.4em] text-gray-400 mb-6"
                style={{ fontFamily: '"Montserrat", serif' }}
              >
                OUR VALUES
              </p>
              <h2
                className="text-2xl md:text-3xl lg:text-4xl font-medium"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                我們相信的事
              </h2>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-l border-gray-200">
            {values.map((value, index) => (
              <FadeInSection key={value.number} delay={index * 150}>
                <div className="border-b border-r border-gray-200 p-8 md:p-12 group hover:bg-white transition-colors duration-500">
                  <span
                    className="text-xs tracking-[0.3em] text-gray-300 group-hover:text-gray-400 transition-colors"
                    style={{ fontFamily: '"Montserrat", serif' }}
                  >
                    {value.number}
                  </span>
                  <h3
                    className="text-xl md:text-2xl font-medium mt-4 mb-4 tracking-wide"
                    style={{ fontFamily: '"Playfair Display", serif' }}
                  >
                    {value.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {value.desc}
                  </p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* 全幅圖片引用 */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/ui/Home_A.jpeg"
          alt="O'CHIU"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <FadeInSection>
          <div className="relative z-10 text-center text-white px-4 max-w-2xl">
            <h2
              className="text-2xl md:text-4xl lg:text-5xl font-medium leading-relaxed italic"
              style={{ fontFamily: '"Montserrat", serif' }}
            >
              Just a mood in the shop.
            </h2>
          </div>
        </FadeInSection>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32">
        <div className="max-w-2xl mx-auto text-center px-4">
          <FadeInSection>
            <p
              className="text-xs tracking-[0.4em] text-gray-400 mb-6"
              style={{ fontFamily: '"Montserrat", serif' }}
            >
              JOIN US
            </p>
            <h2
              className="text-2xl md:text-3xl lg:text-4xl font-medium mb-6"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              準備好認識 O'CHIU 了嗎？
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-10">
              從一件基本款開始，感受我們對面料、版型與細節的執著。
            </p>
          </FadeInSection>
          <FadeInSection delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="px-10 py-4 bg-black text-white text-sm tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                探索全部商品
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://instagram.com/ochiu.co"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 border border-gray-200 text-sm tracking-widest hover:border-black transition-colors"
              >
                追蹤 Instagram
              </a>
            </div>
          </FadeInSection>
        </div>
      </section>
    </div>
  );
}