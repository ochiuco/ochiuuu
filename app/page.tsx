// app/page.tsx
import HeroCarousel from '@/components/ui/HeroCarousel';
import CategoryGrid from '@/components/ui/CategoryGrid';
import BrandBanner from '@/components/ui/BrandBanner';
import InstagramFeed from '@/components/ui/InstagramFeed';

export default function HomePage() {
  return (
    <>
      {/* 标语 - 轮播上方 */}
      <div className="relative z-10 bg-white text-center py-2.5 border-b border-gray-100">
        <p className="text-xs tracking-[0.25em] text-gray-500 font-light">
          Just a mood in the shop.
        </p>
      </div>

      <HeroCarousel />
      <CategoryGrid />
      <BrandBanner />
      <InstagramFeed />
    </>
  );
}