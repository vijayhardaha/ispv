import type { JSX } from 'react';

import { CategorySection } from '@/components/features/CategorySection';
import { CitiesMap } from '@/components/features/CitiesMap';
import { CTASection } from '@/components/features/CTASection';
import { FeaturedVideos } from '@/components/features/FeaturedVideos';
import { HeroSection } from '@/components/features/HeroSection';
import { SloganTicker } from '@/components/features/SloganTicker';
import { getAllVideosFromDb } from '@/data/videos';
import { getCategories } from '@/lib/db';

export default async function HomePage(): Promise<JSX.Element> {
  const [videos, categories] = await Promise.all([getAllVideosFromDb(), getCategories()]);

  const byCategory = Object.fromEntries(categories.map((c) => [c.value, videos.filter((v) => v.category === c.value)]));

  return (
    <>
      <HeroSection />
      <SloganTicker />
      <FeaturedVideos />
      {categories.map((c) => (
        <CategorySection key={c.value} cat={c} videos={byCategory[c.value] ?? []} />
      ))}
      <CitiesMap videos={videos} />
      <CTASection />
    </>
  );
}
