import type { JSX } from 'react';

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

/**
 * Page title for the admin dashboard.
 */
export const metadata: Metadata = { title: 'Dashboard' };

import { CATEGORIES, type CategoryRecord } from '@/constants/categories';
import { TAG_VARIANTS, type TagVariant } from '@/constants/colors';
import { LOCATIONS, type LocationRecord } from '@/constants/locations';
import { cn } from '@/lib/cn';
import { createServerSupabase } from '@/lib/supabase-server';

/**
 * Category record augmented with a live count of associated videos.
 *
 * @type {CategoryWithCount}
 * @property {string} id - Unique identifier for the category.
 * @property {string} value - URL-friendly slug value.
 * @property {string} name - Display name for the category.
 * @property {string} color - Colour identifier for styling.
 * @property {string | null} description - Short description of the category.
 * @property {number} video_count - Number of videos in this category.
 */
interface CategoryWithCount extends CategoryRecord {
  video_count: number;
}

/**
 * Location record augmented with a live count of associated videos.
 *
 * @type {LocationWithCount}
 * @property {string} id - Unique identifier for the location.
 * @property {string} value - URL-friendly slug value.
 * @property {string} name - Display name for the location.
 * @property {string | null} description - Short description of the location.
 * @property {number} video_count - Number of videos in this location.
 */
interface LocationWithCount extends LocationRecord {
  video_count: number;
}

/**
 * Dashboard page displaying video status statistics, categories with counts, and locations with counts.
 *
 * @returns {Promise<JSX.Element>} Rendered dashboard.
 */
export default async function DashboardPage(): Promise<JSX.Element> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Status counts
  const { count: total } = await supabase.from('videos').select('*', { count: 'exact', head: true });
  const { count: draft } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'draft');
  const { count: pending } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_review');
  const { count: published } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');
  const { count: rejected } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected');

  // Categories with video counts
  const categoryCounts = await Promise.all(
    CATEGORIES.map(async (cat) => {
      const { count } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('category', cat.value);
      return { ...cat, video_count: count ?? 0 } as CategoryWithCount;
    })
  );

  // Locations with video counts
  const locationCounts = await Promise.all(
    LOCATIONS.map(async (loc) => {
      const { count } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
        .eq('location', loc.value);
      return { ...loc, video_count: count ?? 0 } as LocationWithCount;
    })
  );

  const stats = [
    { label: 'Total', color: 'bg-black', count: total ?? 0 },
    { label: 'Draft', color: 'bg-gray-400', count: draft ?? 0 },
    { label: 'Pending', color: 'bg-yellow-400', count: pending ?? 0 },
    { label: 'Published', color: 'bg-green-500', count: published ?? 0 },
    { label: 'Rejected', color: 'bg-red-500', count: rejected ?? 0 },
  ];

  const totalCategoryVideos = categoryCounts.reduce((sum, c) => sum + c.video_count, 0);
  const totalLocationVideos = locationCounts.reduce((sum, l) => sum + l.video_count, 0);

  return (
    <section className="py-8" aria-labelledby="dashboard-heading">
      <h1 id="dashboard-heading" className="mb-8 text-3xl font-extrabold uppercase">
        Dashboard
      </h1>

      {/* Status cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((s) => (
          <article key={s.label} className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#18181b]">
            <div className={`mb-2 h-3 w-3 ${s.color}`} />
            <div className="text-3xl font-extrabold">{s.count}</div>
            <div className="text-xs font-bold uppercase">{s.label}</div>
          </article>
        ))}
      </div>

      {/* Categories section */}
      <h2 className="mt-10 mb-4 text-2xl font-extrabold uppercase">
        Categories ({categoryCounts.length}) &middot; {totalCategoryVideos} videos
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categoryCounts.map((cat) => (
          <article key={cat.id} className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_#18181b]">
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

      {/* Locations section */}
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
              {loc.description && <div className="mt-0.5 text-xs text-black/50">{loc.description}</div>}
            </div>
            <span className="text-2xl font-extrabold">{loc.video_count}</span>
          </article>
        ))}
        {locationCounts.length === 0 && <p className="col-span-full text-sm text-black/50">No locations found.</p>}
      </div>
    </section>
  );
}
