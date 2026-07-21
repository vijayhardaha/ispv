import Link from 'next/link';
import type { JSX } from 'react';

import { CategorySection } from '@/components/home/CategorySection';
import { CitiesMap } from '@/components/home/CitiesMap';
import { FeaturedVideos } from '@/components/home/FeaturedVideos';
import { HeroSection } from '@/components/home/HeroSection';
import { SloganTicker } from '@/components/home/SloganTicker';
import { VIDEOS, CATEGORIES, type VideoCategory } from '@/data/videos';

/**
 * Home page with hero, featured videos, category sections, and city map.
 *
 * @returns {JSX.Element} Rendered home page layout.
 */
export default function HomePage(): JSX.Element {
  const byCategory = CATEGORIES.reduce<Record<VideoCategory, typeof VIDEOS>>(
    (acc, c) => {
      acc[c.id] = VIDEOS.filter((v) => v.category === c.id);
      return acc;
    },
    {} as Record<VideoCategory, typeof VIDEOS>
  );
  return (
    <>
      <HeroSection />
      <SloganTicker />
      <FeaturedVideos videos={VIDEOS} />
      {CATEGORIES.map((c) => (
        <CategorySection key={c.id} category={c.id} videos={byCategory[c.id]} />
      ))}
      <CitiesMap />
      <CTASection />
    </>
  );
}

/**
 * Call-to-action section encouraging users to submit reels.
 *
 * @returns {JSX.Element} Rendered CTA section with submit and browse buttons.
 */
function CTASection(): JSX.Element {
  return (
    <section className="border-b-[3px] border-black bg-orange-500 py-14">
      <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
        <h2 className="font-display text-3xl font-extrabold tracking-tight uppercase md:text-5xl">
          Got a reel the world should see?
        </h2>
        <p className="mt-3 text-black/80">
          If you filmed something peaceful and public, submit the URL. We'll add it to the archive and the next person
          scrolling will see it.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#submit"
            className="group relative inline-flex items-center justify-center overflow-hidden border-2 border-transparent bg-blue-600 px-8 py-4 font-bold tracking-wider text-white uppercase transition-all duration-300 hover:bg-blue-700 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <span className="relative z-10">Submit a Reel</span>
            <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
          </a>
          <Link
            href="/videos"
            className="group inline-flex items-center justify-center border-2 border-zinc-900 bg-transparent px-8 py-4 font-bold tracking-wider text-zinc-900 uppercase transition-all duration-300 hover:bg-zinc-900 hover:text-white hover:shadow-[4px_4px_0px_0px_rgba(234,179,8,1)]"
          >
            Browse the Archive
          </Link>
        </div>
      </div>
    </section>
  );
}
