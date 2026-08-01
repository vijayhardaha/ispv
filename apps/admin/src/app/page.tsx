import type { JSX } from 'react';

import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { DASHBOARD_STATS_REVALIDATE_SECONDS, DASHBOARD_STATS_TAG } from '@/constants/cache';
import { CATEGORIES, type CategoryRecord } from '@/constants/categories';
import { TAG_VARIANTS, type TagVariant } from '@/constants/colors';
import { LOCATIONS, type LocationRecord } from '@/constants/locations';
import { SITE_CONFIG } from '@/constants/seo';
import { createServiceSupabase } from '@/lib/api';
import { cn } from '@/lib/utils';

/** Admin dashboard page title rendered as an absolute title, bypassing the layout template. */
export const metadata: Metadata = { title: { absolute: SITE_CONFIG.title } };

/**
 * Category record with aggregate video count from the dashboard RPC.
 *
 * @type {CategoryWithCount}
 * @property {number} video_count - Number of videos in this category.
 */
interface CategoryWithCount extends CategoryRecord {
  video_count: number;
}

/**
 * Location record with aggregate video count from the dashboard RPC.
 *
 * @type {LocationWithCount}
 * @property {number} video_count - Number of videos at this location.
 */
interface LocationWithCount extends LocationRecord {
  video_count: number;
}

/**
 * Dashboard status stat card data.
 *
 * @type {StatusStat}
 * @property {string} label - Display label for the stat (e.g. "Total", "Draft").
 * @property {string} color - Tailwind background colour class for the indicator dot.
 * @property {number} count - Number of videos in this status category.
 */
interface StatusStat {
  label: string;
  color: string;
  count: number;
}

/**
 * Raw response shape from the get_dashboard_stats RPC.
 *
 * @type {DashboardStats}
 * @property {number} total_videos - Total number of videos across all categories.
 * @property {number} trashed_count - Number of videos in the trashed state.
 * @property {{ status: string; count: number }[]} status_counts - Per-status counts array.
 * @property {{ slug: string; count: number }[]} category_counts - Per-category counts array.
 * @property {{ slug: string; count: number }[]} location_counts - Per-location counts array.
 */
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
 * Fetches dashboard aggregate stats, cached for 60 seconds and invalidated via tag on writes.
 *
 * Uses the service-role client (no request-scope cookies) because the cached
 * callback may run during background revalidation outside the request context,
 * and the stats are global aggregates shared across all admin users.
 *
 * @returns {Promise<DashboardStats>} Dashboard stats from the get_dashboard_stats RPC.
 */
const getDashboardStats = unstable_cache(
  async (): Promise<DashboardStats> => {
    const supabase = createServiceSupabase();
    if (!supabase) {
      console.error('Dashboard stats: service client misconfigured');
      return { total_videos: 0, trashed_count: 0, status_counts: [], category_counts: [], location_counts: [] };
    }
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    if (error) {
      console.error('Dashboard stats RPC error:', error);
      return { total_videos: 0, trashed_count: 0, status_counts: [], category_counts: [], location_counts: [] };
    }
    return data as DashboardStats;
  },
  ['dashboard-stats'],
  { revalidate: DASHBOARD_STATS_REVALIDATE_SECONDS, tags: [DASHBOARD_STATS_TAG] }
);

/**
 * Dashboard page — shows aggregate stats, status breakdown, category, and location counts.
 *
 * @returns {Promise<JSX.Element>} Admin dashboard with stat cards and tables.
 */
export default async function DashboardPage(): Promise<JSX.Element> {
  // Middleware handles full session validation + redirect; this is a cheap
  // cookie-presence guard that avoids an extra Supabase auth round-trip.
  const cookieStore = await cookies();
  const hasSessionCookie = cookieStore.getAll().some((c) => c.name.includes('auth-token'));
  if (!hasSessionCookie) {
    redirect('/login');
  }

  const stats = await getDashboardStats();

  const statusStats = buildStatusStats(stats);
  const categoryCounts = buildCategoryStats(stats.category_counts);
  const locationCounts = buildLocationStats(stats.location_counts);

  const totalCategoryVideos = categoryCounts.reduce((sum, c) => sum + c.video_count, 0);
  const totalLocationVideos = locationCounts.reduce((sum, l) => sum + l.video_count, 0);

  return (
    <section aria-labelledby="dashboard-heading">
      <header className="mb-6 flex items-center justify-between">
        <h1 id="dashboard-heading" className="text-3xl font-extrabold uppercase">
          Dashboard
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statusStats.map((s) => (
          <article key={s.label} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className={`mb-2 size-3 ${s.color}`} />
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
          <article key={cat.slug} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <span
                className={cn(
                  'inline-block px-2 py-0.5 text-xs font-semibold',
                  TAG_VARIANTS[cat.color as TagVariant] ?? 'bg-gray-200 text-black'
                )}
              >
                {cat.name}
              </span>
              <span className="text-2xl font-extrabold">{cat.video_count}</span>
            </div>
            <p className="text-xs text-gray-500">{cat.description ?? '—'}</p>
          </article>
        ))}
        {categoryCounts.length === 0 && <p className="col-span-full text-sm text-gray-500">No categories found.</p>}
      </div>

      <h2 className="mt-10 mb-4 text-2xl font-extrabold uppercase">
        Locations ({locationCounts.length}) &middot; {totalLocationVideos} videos
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {locationCounts.map((loc) => (
          <article
            key={loc.slug}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
          >
            <div>
              <div className="text-sm font-bold uppercase">{loc.name}</div>
            </div>
            <span className="text-2xl font-extrabold">{loc.video_count}</span>
          </article>
        ))}
        {locationCounts.length === 0 && <p className="col-span-full text-sm text-gray-500">No locations found.</p>}
      </div>
    </section>
  );
}
