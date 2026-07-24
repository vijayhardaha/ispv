import type { JSX } from 'react';

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: 'Dashboard' };

import { CATEGORIES, type CategoryRecord } from '@/constants/categories';
import { TAG_VARIANTS, type TagVariant } from '@/constants/colors';
import { LOCATIONS, type LocationRecord } from '@/constants/locations';
import { cn } from '@/lib/cn';
import { createServerSupabase } from '@/lib/supabase-server';

interface CategoryWithCount extends CategoryRecord {
  video_count: number;
}

interface LocationWithCount extends LocationRecord {
  video_count: number;
}

interface StatusStat {
  label: string;
  color: string;
  count: number;
}

interface DashboardStats {
  total_videos: number;
  trashed_count: number;
  status_counts: { status: string; count: number }[];
  category_counts: { slug: string; count: number }[];
  location_counts: { slug: string; count: number }[];
}

const STATUS_QUERIES: { label: string; color: string; status: string | null }[] = [
  { label: 'Total', color: 'bg-black', status: null },
  { label: 'Draft', color: 'bg-gray-400', status: 'draft' },
  { label: 'Pending', color: 'bg-yellow-400', status: 'pending_review' },
  { label: 'Published', color: 'bg-green-500', status: 'published' },
  { label: 'Rejected', color: 'bg-red-500', status: 'rejected' },
  { label: 'Trashed', color: 'bg-gray-800', status: null },
];

function buildStatusStats(stats: DashboardStats): StatusStat[] {
  const countsMap = Object.fromEntries(stats.status_counts.map((s) => [s.status, s.count]));
  return STATUS_QUERIES.map((s) => ({
    label: s.label,
    color: s.color,
    count: s.status ? (countsMap[s.status] ?? 0) : s.label === 'Trashed' ? stats.trashed_count : stats.total_videos,
  }));
}

/**
 * Merge raw category counts from the dashboard RPC into full category objects with video_count.
 *
 * @param {{ slug: string; count: number }[]} categoryCounts - Counts by slug from RPC.
 *
 * @returns {CategoryWithCount[]} Full category objects with count (0 for missing slugs).
 */
function buildCategoryStats(categoryCounts: { slug: string; count: number }[]): CategoryWithCount[] {
  const countsMap = Object.fromEntries(categoryCounts.map((c) => [c.slug, c.count]));
  return CATEGORIES.map((cat) => ({ ...cat, video_count: countsMap[cat.slug] ?? 0 }));
}

/**
 * Merge raw location counts from the dashboard RPC into full location objects with video_count.
 *
 * @param {{ slug: string; count: number }[]} locationCounts - Counts by slug from RPC.
 *
 * @returns {LocationWithCount[]} Full location objects with count (0 for missing slugs).
 */
function buildLocationStats(locationCounts: { slug: string; count: number }[]): LocationWithCount[] {
  const countsMap = Object.fromEntries(locationCounts.map((l) => [l.slug, l.count]));
  return LOCATIONS.map((loc) => ({ ...loc, video_count: countsMap[loc.slug] ?? 0 }));
}

/**
 * Dashboard page — shows aggregate stats, status breakdown, category, and location counts.
 *
 * @returns {Promise<JSX.Element>} Admin dashboard with stat cards and tables.
 */
export default async function DashboardPage(): Promise<JSX.Element> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase.rpc('get_dashboard_stats');
  const stats: DashboardStats = data ?? {
    total_videos: 0,
    status_counts: [],
    category_counts: [],
    location_counts: [],
  };
  if (error) {
    console.error('Dashboard stats RPC error:', error);
  }

  const statusStats = buildStatusStats(stats);
  const categoryCounts = buildCategoryStats(stats.category_counts);
  const locationCounts = buildLocationStats(stats.location_counts);

  const totalCategoryVideos = categoryCounts.reduce((sum, c) => sum + c.video_count, 0);
  const totalLocationVideos = locationCounts.reduce((sum, l) => sum + l.video_count, 0);

  return (
    <section className="py-8" aria-labelledby="dashboard-heading">
      <h1 id="dashboard-heading" className="mb-8 text-3xl font-extrabold uppercase">
        Dashboard
      </h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {statusStats.map((s) => (
          <article key={s.label} className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#18181b]">
            <div className={`mb-2 h-3 w-3 ${s.color}`} />
            <div className="text-3xl font-extrabold">{s.count}</div>
            <div className="text-xs font-bold uppercase">{s.label}</div>
          </article>
        ))}
      </div>

      <h2 className="mt-10 mb-4 text-2xl font-extrabold uppercase">
        Categories ({categoryCounts.length}) &middot; {totalCategoryVideos} videos
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categoryCounts.map((cat) => (
          <article key={cat.slug} className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#18181b]">
            <div className="mb-2 flex items-center justify-between">
              <span
                className={cn(
                  'inline-block border border-black px-2 py-0.5 text-xs font-bold uppercase',
                  TAG_VARIANTS[cat.color as TagVariant] ?? 'bg-gray-200 text-black'
                )}
              >
                {cat.name}
              </span>
              <span className="text-2xl font-extrabold">{cat.video_count}</span>
            </div>
            <p className="text-xs text-black/60">{cat.description ?? '—'}</p>
          </article>
        ))}
        {categoryCounts.length === 0 && <p className="col-span-full text-sm text-black/50">No categories found.</p>}
      </div>

      <h2 className="mt-10 mb-4 text-2xl font-extrabold uppercase">
        Locations ({locationCounts.length}) &middot; {totalLocationVideos} videos
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {locationCounts.map((loc) => (
          <article
            key={loc.id}
            className="flex items-center justify-between border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#18181b]"
          >
            <div>
              <div className="text-sm font-bold uppercase">{loc.name}</div>
            </div>
            <span className="text-2xl font-extrabold">{loc.video_count}</span>
          </article>
        ))}
        {locationCounts.length === 0 && <p className="col-span-full text-sm text-black/50">No locations found.</p>}
      </div>
    </section>
  );
}
