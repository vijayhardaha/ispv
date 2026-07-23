import type { JSX } from 'react';

import { webPageSchema } from '@vijayhardaha/schema-builder';
import { JsonLd } from '@vijayhardaha/schema-builder/react';
import type { Metadata } from 'next';

import { CategorySection } from '@/components/features/CategorySection';
import { CTASection } from '@/components/features/CTASection';
import { FAQSection } from '@/components/features/FAQSection';
import { FeaturedVideos } from '@/components/features/FeaturedVideos';
import { HeroSection } from '@/components/features/HeroSection';
import { LocationsMap } from '@/components/features/LocationsMap';
import { ShareSection } from '@/components/features/ShareSection';
import { SloganTicker } from '@/components/features/SloganTicker';
import { SITE_CONFIG } from '@/constants/seo';
import { getAllVideosFromDb } from '@/data/videos';
import { getCategories, getFeaturedCategories, getLocations } from '@/lib/db';
import { buildMetadata } from '@/utils/meta';
import { globalSchema } from '@/utils/schema';
import { siteUrl } from '@/utils/seo';

const title = SITE_CONFIG.title;
const description = SITE_CONFIG.description;
const path = '/';
const rootUrl = siteUrl();

export const metadata: Metadata = buildMetadata({ title, description, path });

const schemaData = [...globalSchema(), webPageSchema({ rootUrl, path }, { name: title, description })];

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
      <JsonLd data={schemaData} />
      <HeroSection totalVideos={videos.length} totalCities={totalCities} totalStates={totalStates} />
      <SloganTicker />
      <ShareSection />
      <FeaturedVideos categories={featuredCategories} />
      {categories
        .filter((c) => c.value !== 'other')
        .map((c) => (
          <CategorySection key={c.value} cat={c} videos={byCategory[c.value] ?? []} />
        ))}
      <LocationsMap locations={locations} videos={videos} />
      <FAQSection />
      <CTASection />
    </>
  );
}
