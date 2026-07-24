import { CATEGORIES, FEATURED_CATEGORIES_SLUGS, type DbCategory } from '@/constants/categories';
import { LOCATIONS, type DbLocation } from '@/constants/locations';
import { supabase } from '@/lib/supabase';

export type { DbCategory, DbLocation };

/**
 * Returns all categories with "Other" pinned last.
 *
 * @returns {Promise<DbCategory[]>} Ordered category list.
 */
export async function getCategories(): Promise<DbCategory[]> {
  const list = [...CATEGORIES];
  const other = list.findIndex((c) => c.slug === 'other');
  if (other !== -1) {
    const [item] = list.splice(other, 1);
    list.push(item);
  }
  return list;
}

/**
 * Returns all locations with "Foreign (Outside India)" pinned last.
 *
 * @returns {Promise<DbLocation[]>} Ordered location list.
 */
export async function getLocations(): Promise<DbLocation[]> {
  const list = [...LOCATIONS];
  const foreignIdx = list.findIndex((l) => l.slug === 'foreign');
  if (foreignIdx !== -1) {
    const [item] = list.splice(foreignIdx, 1);
    list.push(item);
  }
  return list;
}

/**
 * Finds a category by its URL-safe slug.
 *
 * @param {string} value - Category slug.
 *
 * @returns {Promise<DbCategory | null>} Matching category or null.
 */
export async function getCategoryByValue(value: string): Promise<DbCategory | null> {
  return CATEGORIES.find((c) => c.slug === value) ?? null;
}

/**
 * Returns featured categories in display order.
 *
 * @returns {Promise<DbCategory[]>} Featured category entries.
 */
export async function getFeaturedCategories(): Promise<DbCategory[]> {
  return FEATURED_CATEGORIES_SLUGS.map((slug) => CATEGORIES.find((c) => c.slug === slug)).filter(
    Boolean
  ) as DbCategory[];
}

/**
 * Fetches tags with occurrence counts from published videos.
 *
 * @returns {Promise<string[]>} Tag names ordered by popularity.
 */
export async function getTags(): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_tags');
  if (error || !data) {
    return [];
  }
  return data.map((r: { tag: string }) => r.tag);
}

/**
 * Checks whether a video with the given URL or extracted Instagram ID already exists.
 *
 * Uses the admin public API so the check includes draft/rejected/trashed records,
 * not just published ones.
 *
 * @param {string} url - The Instagram URL to check.
 *
 * @returns {Promise<{exists: boolean, trashed?: boolean, status?: string, error?: string}>} Duplicate check result.
 */
export async function checkVideoExists(
  url: string
): Promise<{ exists: boolean; trashed?: boolean; status?: string; error?: string }> {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
  if (!adminUrl) {
    return { exists: false, error: 'Admin URL is not configured.' };
  }

  try {
    const response = await fetch(`${adminUrl}/api/public/check-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      cache: 'no-store',
    });

    const data = (await response.json().catch(() => ({}))) as {
      exists?: boolean;
      trashed?: boolean;
      status?: string;
      error?: string;
    };

    if (!response.ok || data.error) {
      return { exists: false, error: data.error ?? `Check failed with status ${response.status}` };
    }

    return { exists: data.exists ?? false, trashed: data.trashed, status: data.status };
  } catch (err) {
    return { exists: false, error: err instanceof Error ? err.message : 'Network error' };
  }
}

/**
 * Returns the total count of published videos.
 *
 * @returns {Promise<number>} Published video count.
 */
export async function getPublishedVideoCount(): Promise<number> {
  const { count, error } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  if (error || count === null) {
    return 0;
  }

  return count;
}

/**
 * Returns the total number of unique cities among published videos.
 *
 * @returns {Promise<number>} Unique city count.
 */
export async function getCityCounts(): Promise<number> {
  const { data, error } = await supabase.rpc('get_city_counts');

  if (error || !data) {
    return 0;
  }

  return data.length;
}

/**
 * Returns the total number of unique locations among published videos.
 *
 * @returns {Promise<number>} Unique location count.
 */
export async function getLocationCounts(): Promise<number> {
  const { data, error } = await supabase.rpc('get_location_counts');

  if (error || !data) {
    return 0;
  }

  return data.length;
}

/**
 * Returns per-location video counts for all published videos.
 * Used by LocationsMap to display counts per state/UT.
 *
 * @returns {Promise<{ slug: string; count: number }[]>} Location slug and video count pairs.
 */
export async function getLocationVideoCounts(): Promise<{ slug: string; count: number }[]> {
  const { data, error } = await supabase.rpc('get_location_counts');

  if (error || !data) {
    return [];
  }

  return data.map((r: { location: string; count: number }) => ({ slug: r.location, count: r.count }));
}

/**
 * Returns per-category video counts for all published videos.
 *
 * @returns {Promise<{ slug: string; count: number }[]>} Category slug and video count pairs.
 */
export async function getCategoryCounts(): Promise<{ slug: string; count: number }[]> {
  const { data, error } = await supabase.rpc('get_category_counts');

  if (error || !data) {
    return [];
  }

  return data.map((r: { slug: string; count: number }) => ({ slug: r.slug, count: r.count }));
}

/**
 * Shape returned by the get_homepage_stats RPC.
 *
 * @type {HomepageStats}
 * @property {number} totalVideos - Total count of published videos.
 * @property {number} totalCities - Count of distinct cities with published videos.
 * @property {number} totalLocations - Count of distinct locations with published videos.
 * @property {{ slug: string; count: number }[]} locationCounts - Per-location video counts.
 */
export interface HomepageStats {
  totalVideos: number;
  totalCities: number;
  totalLocations: number;
  locationCounts: { slug: string; count: number }[];
}

/**
 * Fetches all homepage aggregate stats in a single RPC call.
 *
 * @returns {Promise<HomepageStats>} Aggregated homepage statistics.
 */
export async function getHomepageStats(): Promise<HomepageStats> {
  const { data, error } = await supabase.rpc('get_homepage_stats');

  if (error || !data) {
    return { totalVideos: 0, totalCities: 0, totalLocations: 0, locationCounts: [] };
  }

  return {
    totalVideos: data.total_videos ?? 0,
    totalCities: data.total_cities ?? 0,
    totalLocations: data.total_locations ?? 0,
    locationCounts: data.location_counts ?? [],
  };
}
