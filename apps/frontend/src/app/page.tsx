import { type JSX } from 'react';

import { webPageSchema } from '@vijayhardaha/schema-builder';
import { JsonLd } from '@vijayhardaha/schema-builder/react';
import type { Metadata } from 'next';

import { CategorySectionLoader } from '@/components/features/CategorySectionLoader';
import { CTASection } from '@/components/features/CTASection';
import { FAQSection } from '@/components/features/FAQSection';
import { FeaturedVideos } from '@/components/features/FeaturedVideos';
import { HeroSection } from '@/components/features/HeroSection';
import { LocationsMap } from '@/components/features/LocationsMap';
import { ShareSection } from '@/components/features/ShareSection';
import { SloganTicker } from '@/components/features/SloganTicker';
import { SITE_CONFIG } from '@/constants/seo';
import { getCategories, getFeaturedCategories, getHomepageStats, getLocations } from '@/lib/db';
import { buildMetadata, globalSchema, siteUrl } from '@/lib/seo';
import { getCategorySectionVideos } from '@/lib/videos';

// ── Home page config ──────────────────────────────────────────────────────

/** Site URL used in JSON-LD schemas. */
const ROOT_URL = siteUrl();

const PAGE_TITLE = SITE_CONFIG.title;
const PAGE_DESCRIPTION = SITE_CONFIG.description;
const PAGE_PATH = '/';

/** JSON-LD schema for the home page. */
const PAGE_SCHEMA = [
  ...globalSchema(),
  webPageSchema({ rootUrl: ROOT_URL, path: PAGE_PATH }, { name: PAGE_TITLE, description: PAGE_DESCRIPTION }),
];

// ── Page metadata ──────────────────────────────────────────────────────────

/** SEO metadata for the home page, rendered server-side via next/js. */
export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: PAGE_PATH,
  postfix: false,
});

// ── ISR config ─────────────────────────────────────────────────────────────

/** Revalidate the home page every 5 minutes for Incremental Static Regeneration. */
export const revalidate = 300;

/**
 * Home page — fetches videos and categories, renders hero, sections, and map.
 *
 * @returns {Promise<JSX.Element>} Rendered home page.
 */
export default async function HomePage(): Promise<JSX.Element> {
  const categories = await getCategories();
  const featuredCategories = await getFeaturedCategories();
  const locations = await getLocations();

  const categorySlugs = categories.filter((c) => c.slug !== 'other').map((c) => c.slug);
  const totalSections = categorySlugs.length;

  const statsPromise = getHomepageStats();
  const videosPromise = getCategorySectionVideos(categorySlugs);

  const stats = await statsPromise;

  return (
    <>
      <JsonLd data={PAGE_SCHEMA} />
      <HeroSection totalVideos={stats.totalVideos} totalCities={stats.totalCities} totalStates={stats.totalLocations} />
      <SloganTicker />
      <ShareSection />
      <FeaturedVideos categories={featuredCategories} />
      {categorySlugs.map((slug, i) => (
        <CategorySectionLoader
          key={slug}
          slug={slug}
          index={i}
          totalSections={totalSections}
          videosPromise={videosPromise}
        />
      ))}
      <LocationsMap locations={locations} locationCounts={stats.locationCounts} />
      <FAQSection />
      <CTASection />
    </>
  );
}
