import type { JSX } from 'react';

import { CategorySection } from '@/components/features/CategorySection';
import { CTASection } from '@/components/features/CTASection';
import { FeaturedVideos } from '@/components/features/FeaturedVideos';
import { HeroSection } from '@/components/features/HeroSection';
import { LocationsMap } from '@/components/features/LocationsMap';
import { SloganTicker } from '@/components/features/SloganTicker';
import { getAllVideosFromDb } from '@/data/videos';
import { getCategories, getFeaturedCategories, getLocations } from '@/lib/db';

/**
 * Home page — fetches videos and categories, renders hero, sections, and map.
 *
 * @returns {Promise<JSX.Element>} Rendered home page.
 */
export default async function HomePage(): Promise<JSX.Element> {
  const [videos, categories, featuredCategories, locations] = await Promise.all([
    getAllVideosFromDb(),
    getCategories(),
    getFeaturedCategories(),
    getLocations(),
  ]);

  const byCategory = Object.fromEntries(categories.map((c) => [c.value, videos.filter((v) => v.category === c.value)]));

  const totalCities = new Set(videos.map((v) => v.city).filter(Boolean)).size;
  const totalStates = new Set(videos.map((v) => v.state).filter(Boolean)).size;

  return (
    <>
      <HeroSection totalVideos={videos.length} totalCities={totalCities} totalStates={totalStates} />
      <SloganTicker />
      <FeaturedVideos categories={featuredCategories} />
      {categories
        .filter((c) => c.value !== 'other')
        .map((c) => (
          <CategorySection key={c.value} cat={c} videos={byCategory[c.value] ?? []} />
        ))}
      <LocationsMap locations={locations} videos={videos} />
      <CTASection />
    </>
  );
}
