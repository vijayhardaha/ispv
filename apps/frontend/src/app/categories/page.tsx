import { type JSX } from 'react';

import { breadcrumbSchema, collectionPageSchema } from '@vijayhardaha/schema-builder';
import { JsonLd } from '@vijayhardaha/schema-builder/react';
import { ArrowRight, Grid3x3 } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { RecentlyAddedVideos } from '@/components/features/RecentlyAddedVideos';
import { PageHero } from '@/components/shared/PageHero';
import { Button } from '@/components/ui/Button';
import type { DbCategory } from '@/constants/categories';
import { getCategories, getCategoryVideoCounts } from '@/lib/db';
import { buildMetadata, buildBreadcrumbs, globalSchema, siteUrl } from '@/lib/seo';
import { getPublishedVideos } from '@/lib/videos';

// ── Categories page config ─────────────────────────────────────────────────

/** Site URL used in JSON-LD schemas. */
const ROOT_URL = siteUrl();

/** Page title displayed in SEO metadata. */
const PAGE_TITLE = 'Categories — Browse by Category';
/** Page description used in SEO metadata and Open Graph tags. */
const PAGE_DESCRIPTION =
  'Browse all categories in the Indian Students Protest Vault archive. Explore protest marches, police conduct, Gen Z movement, acts of kindness, women leading, and more.';
/** URL path segment used for canonical links and breadcrumbs. */
const PAGE_PATH = '/categories';

/** JSON-LD schemas for the categories page. */
const PAGE_SCHEMA = [
  ...globalSchema(),
  collectionPageSchema({ rootUrl: ROOT_URL, path: PAGE_PATH }, { name: PAGE_TITLE, description: PAGE_DESCRIPTION }),
  breadcrumbSchema({ rootUrl: ROOT_URL, items: buildBreadcrumbs(PAGE_PATH, 'Categories') }),
];

// ── Page metadata ──────────────────────────────────────────────────────────

/** SEO metadata for the categories page, rendered server-side via next/js. */
export const metadata: Metadata = buildMetadata({ title: PAGE_TITLE, description: PAGE_DESCRIPTION, path: PAGE_PATH });

// ── ISR config ─────────────────────────────────────────────────────────────

/** Revalidate the categories page every 5 minutes for Incremental Static Regeneration. */
export const revalidate = 300;

/**
 * Category card linking to the category detail page with name, description, and video count.
 *
 * @param {object} props - Component props.
 * @param {DbCategory} props.category - Category data to display.
 * @param {number} props.videoCount - Number of videos in this category.
 *
 * @returns {JSX.Element} Rendered category card.
 */
function CategoryCard({ category, videoCount }: { category: DbCategory; videoCount: number }): JSX.Element {
  return (
    <Link
      key={category.slug}
      href={`/categories/${category.slug}`}
      className="group shadow-brutal hover:shadow-brutal-lg relative block overflow-hidden border-2 border-black p-5 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between">
        <span className="inline-flex items-center gap-1 border-2 border-black bg-white px-2.5 py-0.5 font-mono text-xs font-bold text-black uppercase">
          {videoCount} videos
        </span>
        <ArrowRight className="h-6 w-6 -rotate-12 transition-transform group-hover:rotate-0" />
      </div>
      <h2 className="font-display mt-3 text-2xl font-extrabold tracking-tight uppercase">{category.name}</h2>
      <p className="mt-2 max-w-xs text-sm text-black/70">{category.description}</p>
    </Link>
  );
}

/**
 * Responsive grid of all category cards with their video counts.
 *
 * @param {object} props - Component props.
 * @param {DbCategory[]} props.categories - All categories to display.
 * @param {Record<string, number>} props.categoryCounts - Map of category slug to video count.
 *
 * @returns {JSX.Element} Rendered category grid.
 */
function CategoryGrid({
  categories,
  categoryCounts,
}: {
  categories: DbCategory[];
  categoryCounts: Record<string, number>;
}): JSX.Element {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <CategoryCard key={c.slug} category={c} videoCount={categoryCounts[c.slug] ?? 0} />
        ))}
      </div>
    </section>
  );
}

/**
 * Call-to-action banner linking to the full video archive.
 *
 * @returns {JSX.Element} Rendered CTA banner.
 */
function FullArchiveCta(): JSX.Element {
  return (
    <section className="border-t-2 border-black bg-yellow-400 py-10">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4 px-4 text-center md:px-6">
        <Grid3x3 className="h-10 w-10" />
        <h2 className="font-display text-3xl font-extrabold tracking-tight uppercase">Want the full archive?</h2>
        <Link href="/videos">
          <Button variant="default" size="lg">
            View All Videos <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

/**
 * Categories listing page — renders categories with video counts and recently added videos.
 * Fetches data server-side; no client-side loading state needed.
 *
 * @returns {Promise<JSX.Element>} Rendered categories page.
 */
export default async function CategoriesPage(): Promise<JSX.Element> {
  const [{ videos }, categoryCountsRaw] = await Promise.all([
    getPublishedVideos({ perPage: 12 }),
    getCategoryVideoCounts(),
  ]);

  const categories = await getCategories();
  const categoryCounts = Object.fromEntries(categoryCountsRaw.map((cc) => [cc.slug, cc.count]));

  return (
    <div>
      <JsonLd data={PAGE_SCHEMA} />

      <PageHero breadcrumb="Categories" title="Browse by Category">
        <p className="mt-2 max-w-2xl text-white/80">
          All categories from the archive. Click into any to see the full list, or jump to{' '}
          <Link
            href="/videos"
            className="decoration-saffron underline decoration-2 underline-offset-4 hover:text-yellow-500"
          >
            all videos
          </Link>
          .
        </p>
      </PageHero>

      <CategoryGrid categories={categories} categoryCounts={categoryCounts} />

      <FullArchiveCta />

      <RecentlyAddedVideos videos={videos} />
    </div>
  );
}
