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
 * @returns {Promise<{exists: boolean, trashed?: boolean, status?: string}>} Duplicate check result.
 */
export async function checkVideoExists(url: string): Promise<{ exists: boolean; trashed?: boolean; status?: string }> {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
  if (!adminUrl) {
    return { exists: false };
  }

  try {
    const response = await fetch(`${adminUrl}/api/public/check-video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
      // Skip Next.js caching for this data-sensitive check
      cache: 'no-store',
    });

    if (!response.ok) {
      return { exists: false };
    }

    const data = (await response.json()) as { exists: boolean; trashed?: boolean; status?: string };
    return data;
  } catch {
    return { exists: false };
  }
}
