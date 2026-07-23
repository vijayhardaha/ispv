import { supabase } from '@/lib/supabase';

export interface DbCategory {
  id: string;
  value: string;
  name: string;
  color: string;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

export interface DbLocation {
  id: string;
  value: string;
  name: string;
  description: string | null;
}

/**
 * Fetches all categories from Supabase, ordered by name, with "other" pinned to the end.
 *
 * @returns {Promise<DbCategory[]>} Array of category entries.
 */
export async function getCategories(): Promise<DbCategory[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  const list: DbCategory[] = data ?? [];
  const other = list.findIndex((c) => c.value === 'other');
  if (other !== -1) {
    const [item] = list.splice(other, 1);
    list.push(item);
  }
  return list;
}

/**
 * Fetches all locations from Supabase, ordered by name, with "Foreign (Outside India)" pinned to the end.
 *
 * @returns {Promise<DbLocation[]>} Array of location entries.
 */
export async function getLocations(): Promise<DbLocation[]> {
  const { data, error } = await supabase.from('locations').select('*').order('name');
  if (error) throw error;
  const list: DbLocation[] = data ?? [];
  const foreignIdx = list.findIndex((l) => l.value === 'foreign');
  if (foreignIdx !== -1) {
    const [item] = list.splice(foreignIdx, 1);
    list.push(item);
  }
  return list;
}

/**
 * Fetches a single category by its URL-safe value slug.
 *
 * @param {string} value - Category value slug (e.g., "protest-marches").
 *
 * @returns {Promise<DbCategory | null>} Category entry, or null if not found.
 */
export async function getCategoryByValue(value: string): Promise<DbCategory | null> {
  const { data, error } = await supabase.from('categories').select('*').eq('value', value).single();
  if (error) return null;
  return data;
}

/**
 * Fetches tags with occurrence counts from published videos, sorted by frequency descending.
 *
 * @returns {Promise<string[]>} Tag names ordered by popularity.
 */
export async function getTags(): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_tags');
  if (error || !data) return [];
  return data.map((r: { tag: string }) => r.tag);
}

const FEATURED_SLUGS = [
  'protest-marches',
  'police-conduct',
  'gen-z-movement',
  'acts-of-kindness',
  'women-leading',
  'human-rights',
];

/**
 * Fetches featured categories by predefined slugs, preserving the configured display order.
 *
 * @returns {Promise<DbCategory[]>} Array of featured category entries in display order.
 */
export async function getFeaturedCategories(): Promise<DbCategory[]> {
  const { data, error } = await supabase.from('categories').select('*').in('value', FEATURED_SLUGS);
  if (error || !data) return [];
  const items: DbCategory[] = data;
  return FEATURED_SLUGS.map((slug) => items.find((c) => c.value === slug)).filter(Boolean) as DbCategory[];
}
