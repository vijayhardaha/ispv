import type { JSX } from 'react';

import { CategorySection } from '@/components/features/CategorySection';
import { CitiesMap } from '@/components/features/CitiesMap';
import { CTASection } from '@/components/features/CTASection';
import { FeaturedVideos } from '@/components/features/FeaturedVideos';
import { HeroSection } from '@/components/features/HeroSection';
import { SloganTicker } from '@/components/features/SloganTicker';
import { CATEGORIES, type VideoCategory } from '@/constants/categories';
import { getAllVideosFromDb } from '@/data/videos';

/**
 * Homepage with hero, featured videos, category sections, cities map, and CTA.
 *
 * @returns {JSX.Element} Rendered homepage.
 */
export default async function HomePage(): Promise<JSX.Element> {
  const videos = await getAllVideosFromDb();
  const byCategory = CATEGORIES.reduce<Record<VideoCategory, typeof videos>>(
    (acc, c) => {
      acc[c.id] = videos.filter((v) => v.category === c.id);
      return acc;
    },
    {} as Record<VideoCategory, typeof videos>
  );
  return (
    <>
      <HeroSection />
      <SloganTicker />
      <FeaturedVideos videos={videos} />
      {CATEGORIES.map((c) => (
        <CategorySection key={c.id} category={c.id} videos={byCategory[c.id]} />
      ))}
      <CitiesMap videos={videos} />
      <CTASection />
    </>
  );
}
