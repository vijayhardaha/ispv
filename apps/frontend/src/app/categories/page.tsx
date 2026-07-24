import { type JSX } from 'react';

import { breadcrumbSchema, collectionPageSchema } from '@vijayhardaha/schema-builder';
import { JsonLd } from '@vijayhardaha/schema-builder/react';
import { ArrowRight, Grid3x3 } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { RecentlyAddedVideos } from '@/components/features/RecentlyAddedVideos';
import { PageHero } from '@/components/shared/PageHero';
import { Button } from '@/components/ui/Button';
import { CATEGORIES } from '@/constants/categories';
import type { DbCategory } from '@/constants/categories';
import { getCategoryCounts } from '@/lib/db';
import { buildMetadata } from '@/lib/meta';
import { buildBreadcrumbs, globalSchema } from '@/lib/schema';
import { siteUrl } from '@/lib/seo';
import { getPublishedVideos } from '@/lib/videos';

const PAGE_TITLE = 'Categories — Browse by Category';
const PAGE_DESCRIPTION =
  'Browse all categories in the Indian Students Protest Vault archive. Explore protest marches, police conduct, Gen Z movement, acts of kindness, women leading, and more.';
const PAGE_PATH = '/categories';
const ROOT_URL = siteUrl();

export const metadata: Metadata = buildMetadata({ title: PAGE_TITLE, description: PAGE_DESCRIPTION, path: PAGE_PATH });

export const revalidate = 300;

const SCHEMA_DATA = [
  ...globalSchema(),
  collectionPageSchema({ rootUrl: ROOT_URL, path: PAGE_PATH }, { name: PAGE_TITLE, description: PAGE_DESCRIPTION }),
  breadcrumbSchema({ rootUrl: ROOT_URL, items: buildBreadcrumbs(PAGE_PATH, 'Categories') }),
];

function sortCategoriesWithOtherLast(): DbCategory[] {
  const list = [...CATEGORIES];
  const other = list.findIndex((c) => c.slug === 'other');
  if (other !== -1) {
    const [item] = list.splice(other, 1);
    list.push(item);
  }
  return list;
}

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
      <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight uppercase md:text-4xl">
        {category.name}
      </h2>
      <p className="mt-2 max-w-xs text-sm opacity-90">{category.description}</p>
    </Link>
  );
}

function CategoryGrid({
  categories,
  categoryCounts,
}: {
  categories: DbCategory[];
  categoryCounts: Record<string, number>;
}): JSX.Element {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <CategoryCard key={c.slug} category={c} videoCount={categoryCounts[c.slug] ?? 0} />
        ))}
      </div>
    </section>
  );
}

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
  const [{ videos }, categoryCountsRaw] = await Promise.all([getPublishedVideos({ perPage: 12 }), getCategoryCounts()]);

  const categories = sortCategoriesWithOtherLast();
  const categoryCounts = Object.fromEntries(categoryCountsRaw.map((cc) => [cc.slug, cc.count]));

  return (
    <div>
      <JsonLd data={SCHEMA_DATA} />

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
