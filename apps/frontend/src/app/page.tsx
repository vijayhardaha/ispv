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
import { PullQuoteSection } from '@/components/features/PullQuoteSection';
import { ShareSection } from '@/components/features/ShareSection';
import { SloganTicker } from '@/components/features/SloganTicker';
import { SITE_CONFIG } from '@/constants/seo';
import { SLOGANS_PULL_QUOTES } from '@/constants/slogans';
import { getCategories, getFeaturedCategories, getLocations } from '@/lib/db';
import { buildMetadata } from '@/lib/meta';
import { globalSchema } from '@/lib/schema';
import { siteUrl } from '@/lib/seo';
import { getAllVideosFromDb } from '@/lib/videos';

const PAGE_TITLE = SITE_CONFIG.title;
const PAGE_DESCRIPTION = SITE_CONFIG.description;
const PAGE_PATH = '/';
const ROOT_URL = siteUrl();

export const metadata: Metadata = buildMetadata({ title: PAGE_TITLE, description: PAGE_DESCRIPTION, path: PAGE_PATH });

const SCHEMA_DATA = [
  ...globalSchema(),
  webPageSchema({ rootUrl: ROOT_URL, path: PAGE_PATH }, { name: PAGE_TITLE, description: PAGE_DESCRIPTION }),
];

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

  const byCategory = Object.fromEntries(categories.map((c) => [c.slug, videos.filter((v) => v.category === c.slug)]));

  const totalCities = new Set(videos.map((v) => v.city).filter(Boolean)).size;
  const totalStates = new Set(videos.map((v) => v.location).filter(Boolean)).size;

  return (
    <>
      <JsonLd data={SCHEMA_DATA} />
      <HeroSection totalVideos={videos.length} totalCities={totalCities} totalStates={totalStates} />
      <SloganTicker />
      <ShareSection />
      <FeaturedVideos categories={featuredCategories} />
      {(() => {
        const filtered = categories.filter((c) => c.slug !== 'other');
        return filtered.flatMap((c, i) => {
          const sections: JSX.Element[] = [<CategorySection key={c.slug} cat={c} videos={byCategory[c.slug] ?? []} />];
          if (i < filtered.length - 1) {
            const quote = SLOGANS_PULL_QUOTES[i % SLOGANS_PULL_QUOTES.length];
            sections.push(<PullQuoteSection key={`quote-${i}`} quote={quote.quote} person={quote.person} index={i} />);
          }
          return sections;
        });
      })()}
      <LocationsMap locations={locations} videos={videos} />
      <FAQSection />
      <CTASection />
    </>
  );
}
