/**
 * @file filterVideos.test.ts
 * Unit tests for the video filtering utility.
 */

import { describe, expect, it } from 'vitest';

import { filterVideos } from '@/lib/helpers/filterVideos';
import type { FilterState } from '@/lib/helpers/filterVideos';
import type { VideoEntry } from '@/lib/videos';

const makeVideo = (overrides: Partial<VideoEntry> = {}): VideoEntry => ({
  id: '1',
  description: 'Students marching peacefully in Delhi',
  url: 'https://instagram.com/p/abc123/',
  thumbnail: 'https://example.com/thumb.jpg',
  city: 'Delhi',
  location: 'Delhi',
  category: 'protest-marches',
  categoryName: 'Protest Marches',
  tags: ['peaceful', 'students', 'Delhi'],
  duration: 0,
  viewCount: 0,
  videoPostDate: null,
  createdAt: '2026-01-01T00:00:00Z',
  trending: false,
  ...overrides,
});

describe('filterVideos', () => {
  const baseState: FilterState = {
    query: '',
    category: 'all',
    location: 'all',
    tags: [],
    page: 1,
    perPage: 36,
    sort: 'posted_date_desc',
  };

  it('returns all videos with default filter state', () => {
    const videos = [makeVideo({ id: '1' }), makeVideo({ id: '2', city: 'Mumbai' })];
    expect(filterVideos(videos, baseState)).toHaveLength(2);
  });

  describe('category filter', () => {
    it('filters by category', () => {
      const videos = [
        makeVideo({ id: '1', category: 'protest-marches' }),
        makeVideo({ id: '2', category: 'human-rights' }),
      ];
      const result = filterVideos(videos, { ...baseState, category: 'human-rights' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('returns no videos when no category matches', () => {
      const videos = [makeVideo({ id: '1', category: 'protest-marches' })];
      expect(filterVideos(videos, { ...baseState, category: 'art' })).toHaveLength(0);
    });

    it('passes all videos when category is "all"', () => {
      const videos = [
        makeVideo({ id: '1', category: 'protest-marches' }),
        makeVideo({ id: '2', category: 'human-rights' }),
      ];
      expect(filterVideos(videos, { ...baseState, category: 'all' })).toHaveLength(2);
    });
  });

  describe('location filter', () => {
    it('filters by state/location (case-insensitive)', () => {
      const videos = [makeVideo({ id: '1', location: 'Delhi' }), makeVideo({ id: '2', location: 'Maharashtra' })];
      const result = filterVideos(videos, { ...baseState, location: 'delhi' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('passes all videos when location is "all"', () => {
      const videos = [makeVideo({ id: '1', location: 'Delhi' }), makeVideo({ id: '2', location: 'Maharashtra' })];
      expect(filterVideos(videos, { ...baseState, location: 'all' })).toHaveLength(2);
    });
  });

  describe('tags filter', () => {
    it('filters by tags (all specified tags must match)', () => {
      const videos = [
        makeVideo({ id: '1', tags: ['peaceful', 'students', 'delhi'] }),
        makeVideo({ id: '2', tags: ['peaceful', 'women'] }),
      ];
      const result = filterVideos(videos, { ...baseState, tags: ['peaceful'] });
      expect(result).toHaveLength(2);
    });

    it('requires all tags to match (AND logic)', () => {
      const videos = [
        makeVideo({ id: '1', tags: ['peaceful', 'students'] }),
        makeVideo({ id: '2', tags: ['peaceful', 'women'] }),
      ];
      const result = filterVideos(videos, { ...baseState, tags: ['peaceful', 'women'] });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('returns empty when no video has all required tags', () => {
      const videos = [makeVideo({ id: '1', tags: ['peaceful', 'students'] })];
      expect(filterVideos(videos, { ...baseState, tags: ['peaceful', 'violence'] })).toHaveLength(0);
    });

    it('passes all videos when tags array is empty', () => {
      const videos = [makeVideo({ id: '1', tags: ['peaceful'] }), makeVideo({ id: '2', tags: ['women'] })];
      expect(filterVideos(videos, { ...baseState, tags: [] })).toHaveLength(2);
    });
  });

  describe('text search query', () => {
    it('matches video description (case-insensitive)', () => {
      const videos = [
        makeVideo({ id: '1', description: 'Students marching peacefully' }),
        makeVideo({ id: '2', description: 'Police presence at rally' }),
      ];
      const result = filterVideos(videos, { ...baseState, query: 'peacefully' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('matches city name', () => {
      const videos = [makeVideo({ id: '1', city: 'Delhi' }), makeVideo({ id: '2', city: 'Mumbai' })];
      const result = filterVideos(videos, { ...baseState, query: 'mumbai' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('matches state name', () => {
      const videos = [makeVideo({ id: '1', location: 'Delhi' }), makeVideo({ id: '2', location: 'Maharashtra' })];
      const result = filterVideos(videos, { ...baseState, query: 'maharashtra' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('matches tags', () => {
      const videos = [
        makeVideo({ id: '1', tags: ['peaceful', 'students'], description: 'Delhi protest' }),
        makeVideo({ id: '2', tags: ['women', 'rights'], description: 'Mumbai rally' }),
      ];
      const result = filterVideos(videos, { ...baseState, query: 'peaceful' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('matches tags by description', () => {
      const videos = [
        makeVideo({ id: '1', tags: ['peaceful', 'students'], description: 'Delhi protest' }),
        makeVideo({ id: '2', tags: ['women', 'rights'], description: 'Mumbai rally' }),
      ];
      const result = filterVideos(videos, { ...baseState, query: 'peaceful' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('returns empty when no match found', () => {
      const videos = [makeVideo({ id: '1', description: 'Delhi protest' })];
      expect(filterVideos(videos, { ...baseState, query: 'zzzzz' })).toHaveLength(0);
    });

    it('ignores whitespace in query', () => {
      const videos = [makeVideo({ id: '1', description: 'Students marching' })];
      const result = filterVideos(videos, { ...baseState, query: '  marching  ' });
      expect(result).toHaveLength(1);
    });
  });

  it('combines multiple filters (AND logic)', () => {
    const videos = [
      makeVideo({ id: '1', category: 'protest-marches', location: 'Delhi', tags: ['peaceful'] }),
      makeVideo({ id: '2', category: 'human-rights', location: 'Delhi', tags: ['peaceful'] }),
      makeVideo({ id: '3', category: 'protest-marches', location: 'Maharashtra', tags: ['peaceful'] }),
    ];
    const result = filterVideos(videos, {
      ...baseState,
      category: 'protest-marches',
      location: 'delhi',
      tags: ['peaceful'],
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  describe('sort options', () => {
    it('sorts by views descending', () => {
      const videos = [makeVideo({ id: '1', viewCount: 100 }), makeVideo({ id: '2', viewCount: 500 })];
      const result = filterVideos(videos, { ...baseState, sort: 'views_desc' });
      expect(result.map((v) => v.id)).toEqual(['2', '1']);
    });

    it('sorts by views ascending', () => {
      const videos = [makeVideo({ id: '1', viewCount: 100 }), makeVideo({ id: '2', viewCount: 500 })];
      const result = filterVideos(videos, { ...baseState, sort: 'views_asc' });
      expect(result.map((v) => v.id)).toEqual(['1', '2']);
    });

    it('sorts by posted date descending', () => {
      const videos = [
        makeVideo({ id: '1', videoPostDate: '2026-01-01T00:00:00Z' }),
        makeVideo({ id: '2', videoPostDate: '2026-06-01T00:00:00Z' }),
      ];
      const result = filterVideos(videos, { ...baseState, sort: 'posted_date_desc' });
      expect(result.map((v) => v.id)).toEqual(['2', '1']);
    });

    it('sorts by posted date ascending', () => {
      const videos = [
        makeVideo({ id: '1', videoPostDate: '2026-01-01T00:00:00Z' }),
        makeVideo({ id: '2', videoPostDate: '2026-06-01T00:00:00Z' }),
      ];
      const result = filterVideos(videos, { ...baseState, sort: 'posted_date_asc' });
      expect(result.map((v) => v.id)).toEqual(['1', '2']);
    });

    it('sorts by posted date with null values (desc)', () => {
      const videos = [
        makeVideo({ id: '1', videoPostDate: null }),
        makeVideo({ id: '2', videoPostDate: '2026-06-01T00:00:00Z' }),
      ];
      const result = filterVideos(videos, { ...baseState, sort: 'posted_date_desc' });
      expect(result.map((v) => v.id)).toEqual(['2', '1']);
    });

    it('sorts by posted date with null values (asc)', () => {
      const videos = [
        makeVideo({ id: '1', videoPostDate: null }),
        makeVideo({ id: '2', videoPostDate: '2026-06-01T00:00:00Z' }),
      ];
      const result = filterVideos(videos, { ...baseState, sort: 'posted_date_asc' });
      expect(result.map((v) => v.id)).toEqual(['1', '2']);
    });

    it('sorts by posted date with both null', () => {
      const videos = [makeVideo({ id: '1', videoPostDate: null }), makeVideo({ id: '2', videoPostDate: null })];
      const result = filterVideos(videos, { ...baseState, sort: 'posted_date_desc' });
      expect(result).toHaveLength(2);
    });

    it('sorts by created date descending', () => {
      const videos = [
        makeVideo({ id: '1', createdAt: '2026-01-01T00:00:00Z' }),
        makeVideo({ id: '2', createdAt: '2026-06-01T00:00:00Z' }),
      ];
      const result = filterVideos(videos, { ...baseState, sort: 'created_date_desc' });
      expect(result.map((v) => v.id)).toEqual(['2', '1']);
    });

    it('sorts by created date ascending', () => {
      const videos = [
        makeVideo({ id: '1', createdAt: '2026-01-01T00:00:00Z' }),
        makeVideo({ id: '2', createdAt: '2026-06-01T00:00:00Z' }),
      ];
      const result = filterVideos(videos, { ...baseState, sort: 'created_date_asc' });
      expect(result.map((v) => v.id)).toEqual(['1', '2']);
    });

    it('sorts by city ascending', () => {
      const videos = [makeVideo({ id: '1', city: 'Mumbai' }), makeVideo({ id: '2', city: 'Delhi' })];
      const result = filterVideos(videos, { ...baseState, sort: 'city_asc' });
      expect(result.map((v) => v.id)).toEqual(['2', '1']);
    });

    it('sorts by city descending', () => {
      const videos = [makeVideo({ id: '1', city: 'Mumbai' }), makeVideo({ id: '2', city: 'Delhi' })];
      const result = filterVideos(videos, { ...baseState, sort: 'city_desc' });
      expect(result.map((v) => v.id)).toEqual(['1', '2']);
    });

    it('sorts by location ascending', () => {
      const videos = [makeVideo({ id: '1', location: 'Maharashtra' }), makeVideo({ id: '2', location: 'Delhi' })];
      const result = filterVideos(videos, { ...baseState, sort: 'location_asc' });
      expect(result.map((v) => v.id)).toEqual(['2', '1']);
    });

    it('sorts by location descending', () => {
      const videos = [makeVideo({ id: '1', location: 'Maharashtra' }), makeVideo({ id: '2', location: 'Delhi' })];
      const result = filterVideos(videos, { ...baseState, sort: 'location_desc' });
      expect(result.map((v) => v.id)).toEqual(['1', '2']);
    });
  });
});
