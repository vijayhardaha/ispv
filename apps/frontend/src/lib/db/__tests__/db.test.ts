/**
 * @file db.test.ts
 * Unit tests for the frontend DB wrapper functions.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { CATEGORIES, FEATURED_CATEGORIES_SLUGS } from '@/constants/categories';
import { LOCATIONS } from '@/constants/locations';
import {
  supabase,
  checkVideoExists,
  getCategories,
  getCategoryByValue,
  getCategoryVideoCounts,
  getFeaturedCategories,
  getHomepageStats,
  getLocationVideoCounts,
  getLocations,
  getTags,
} from '@/lib/db';

vi.mock('@/lib/db/supabase', () => ({ supabase: { rpc: vi.fn() } }));

describe('getCategories', () => {
  it('returns all categories with Other pinned last', async () => {
    const result = await getCategories();
    expect(result).toHaveLength(CATEGORIES.length);
    expect(result[result.length - 1].slug).toBe('other');
    expect(result.map((c) => c.slug)).toEqual(CATEGORIES.map((c) => c.slug));
  });

  it('returns the Other category only once', async () => {
    const result = await getCategories();
    const others = result.filter((c) => c.slug === 'other');
    expect(others).toHaveLength(1);
  });
});

describe('getFeaturedCategories', () => {
  it('returns categories matching the featured slugs in order', async () => {
    const result = await getFeaturedCategories();
    expect(result.map((c) => c.slug)).toEqual(FEATURED_CATEGORIES_SLUGS);
  });

  it('resolves every featured slug to a real category', async () => {
    const result = await getFeaturedCategories();
    for (const cat of result) {
      expect(CATEGORIES).toContain(cat);
    }
  });
});

describe('getCategoryByValue', () => {
  it('returns the matching category for a known slug', async () => {
    const result = await getCategoryByValue('police-conduct');
    expect(result?.slug).toBe('police-conduct');
  });

  it('returns null for an unknown slug', async () => {
    const result = await getCategoryByValue('unknown-slug');
    expect(result).toBeNull();
  });
});

describe('getLocations', () => {
  it('returns all locations with Foreign pinned last', async () => {
    const result = await getLocations();
    expect(result).toHaveLength(LOCATIONS.length);
    expect(result[result.length - 1].slug).toBe('foreign');
  });

  it('returns the Foreign location only once', async () => {
    const result = await getLocations();
    const foreigners = result.filter((l) => l.slug === 'foreign');
    expect(foreigners).toHaveLength(1);
  });
});

describe('RPC wrapper functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCategoryVideoCounts maps RPC rows', async () => {
    (supabase.rpc as any).mockResolvedValue({
      data: [
        { slug: 'protest-marches', count: 10 },
        { slug: 'police-conduct', count: 5 },
      ],
      error: null,
    });

    const result = await getCategoryVideoCounts();
    expect(supabase.rpc).toHaveBeenCalledWith('get_category_counts');
    expect(result).toEqual([
      { slug: 'protest-marches', count: 10 },
      { slug: 'police-conduct', count: 5 },
    ]);
  });

  it('getCategoryVideoCounts returns empty array on error', async () => {
    (supabase.rpc as any).mockResolvedValue({ data: null, error: { message: 'RPC error' } });
    expect(await getCategoryVideoCounts()).toEqual([]);
  });

  it('getTags maps RPC rows to tag names', async () => {
    (supabase.rpc as any).mockResolvedValue({ data: [{ tag: 'protest' }, { tag: 'peaceful' }], error: null });

    const result = await getTags();
    expect(supabase.rpc).toHaveBeenCalledWith('get_tags');
    expect(result).toEqual(['protest', 'peaceful']);
  });

  it('getTags returns empty array on error', async () => {
    (supabase.rpc as any).mockResolvedValue({ data: null, error: { message: 'RPC error' } });
    expect(await getTags()).toEqual([]);
  });

  it('getLocationVideoCounts maps RPC rows', async () => {
    (supabase.rpc as any).mockResolvedValue({
      data: [
        { location: 'delhi', count: 12 },
        { location: 'madhya-pradesh', count: 3 },
      ],
      error: null,
    });

    const result = await getLocationVideoCounts();
    expect(supabase.rpc).toHaveBeenCalledWith('get_location_counts');
    expect(result).toEqual([
      { slug: 'delhi', count: 12 },
      { slug: 'madhya-pradesh', count: 3 },
    ]);
  });

  it('getLocationVideoCounts returns empty array on error', async () => {
    (supabase.rpc as any).mockResolvedValue({ data: null, error: { message: 'RPC error' } });
    expect(await getLocationVideoCounts()).toEqual([]);
  });

  it('getHomepageStats maps RPC response fields', async () => {
    (supabase.rpc as any).mockResolvedValue({
      data: {
        total_videos: 100,
        total_cities: 40,
        total_locations: 30,
        location_counts: [{ slug: 'delhi', count: 50 }],
      },
      error: null,
    });

    const result = await getHomepageStats();
    expect(supabase.rpc).toHaveBeenCalledWith('get_homepage_stats');
    expect(result).toEqual({
      totalVideos: 100,
      totalCities: 40,
      totalLocations: 30,
      locationCounts: [{ slug: 'delhi', count: 50 }],
    });
  });

  it('getHomepageStats returns zeroed stats on error', async () => {
    (supabase.rpc as any).mockResolvedValue({ data: null, error: { message: 'RPC error' } });
    expect(await getHomepageStats()).toEqual({ totalVideos: 0, totalCities: 0, totalLocations: 0, locationCounts: [] });
  });
});

describe('checkVideoExists', () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env = originalEnv;
  });

  it('returns an error when the admin URL is not configured', async () => {
    delete process.env.NEXT_PUBLIC_ADMIN_URL;
    const result = await checkVideoExists('https://instagram.com/reel/abc');
    expect(result).toEqual({ exists: false, error: 'Admin URL is not configured.' });
  });

  it('returns exists true when the check API reports a duplicate', async () => {
    process.env.NEXT_PUBLIC_ADMIN_URL = 'https://admin.example.com';
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ exists: true, trashed: false, status: 'published' }),
    });

    const result = await checkVideoExists('https://instagram.com/reel/abc');

    expect(globalThis.fetch).toHaveBeenCalledWith('https://admin.example.com/api/public/check-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://instagram.com/reel/abc' }),
      cache: 'no-store',
    });
    expect(result).toEqual({ exists: true, trashed: false, status: 'published' });
  });

  it('returns error from response body on non-ok status', async () => {
    process.env.NEXT_PUBLIC_ADMIN_URL = 'https://admin.example.com';
    (globalThis.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error' }),
    });

    const result = await checkVideoExists('https://instagram.com/reel/abc');
    expect(result).toEqual({ exists: false, error: 'Server error' });
  });

  it('returns error with status when response body has no message', async () => {
    process.env.NEXT_PUBLIC_ADMIN_URL = 'https://admin.example.com';
    (globalThis.fetch as any).mockResolvedValue({ ok: false, status: 429, json: async () => ({}) });

    const result = await checkVideoExists('https://instagram.com/reel/abc');
    expect(result).toEqual({ exists: false, error: 'Check failed with status 429' });
  });

  it('returns a network error when fetch throws', async () => {
    process.env.NEXT_PUBLIC_ADMIN_URL = 'https://admin.example.com';
    (globalThis.fetch as any).mockRejectedValue(new Error('Network down'));

    const result = await checkVideoExists('https://instagram.com/reel/abc');
    expect(result).toEqual({ exists: false, error: 'Network down' });
  });
});
