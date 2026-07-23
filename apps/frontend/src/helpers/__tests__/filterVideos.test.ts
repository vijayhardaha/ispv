/**
 * @file filterVideos.test.ts
 * Unit tests for the video filtering utility.
 */

import { describe, expect, it } from 'vitest';

import type { FilterState } from '@/components/shared/FilterBar';
import type { VideoEntry } from '@/data/videos';
import { filterVideos } from '@/helpers/filterVideos';

const makeVideo = (overrides: Partial<VideoEntry> = {}): VideoEntry => ({
  id: '1',
  description: 'Students marching peacefully in Delhi',
  url: 'https://instagram.com/p/abc123/',
  thumbnail: 'https://example.com/thumb.jpg',
  city: 'Delhi',
  state: 'Delhi',
  category: 'protest-marches',
  categoryName: 'Protest Marches',
  tags: ['peaceful', 'students', 'delhi'],
  hashtags: ['#peaceful', '#students', '#Delhi'],
  duration: 0,
  featured: false,
  ...overrides,
});

describe('filterVideos', () => {
  const baseState: FilterState = { query: '', category: 'all', location: 'all', tags: [], page: 1, perPage: 36 };

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
      const videos = [
        makeVideo({ id: '1', state: 'Delhi' }),
        makeVideo({ id: '2', state: 'Maharashtra' }),
      ];
      const result = filterVideos(videos, { ...baseState, location: 'delhi' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('passes all videos when location is "all"', () => {
      const videos = [
        makeVideo({ id: '1', state: 'Delhi' }),
        makeVideo({ id: '2', state: 'Maharashtra' }),
      ];
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
      const videos = [
        makeVideo({ id: '1', tags: ['peaceful'] }),
        makeVideo({ id: '2', tags: ['women'] }),
      ];
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
      const videos = [
        makeVideo({ id: '1', city: 'Delhi' }),
        makeVideo({ id: '2', city: 'Mumbai' }),
      ];
      const result = filterVideos(videos, { ...baseState, query: 'mumbai' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('matches state name', () => {
      const videos = [
        makeVideo({ id: '1', state: 'Delhi' }),
        makeVideo({ id: '2', state: 'Maharashtra' }),
      ];
      const result = filterVideos(videos, { ...baseState, query: 'maharashtra' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('matches hashtags', () => {
      const videos = [
        makeVideo({ id: '1', hashtags: ['#peaceful', '#students'], tags: ['peaceful', 'students'], description: 'Delhi protest' }),
        makeVideo({ id: '2', hashtags: ['#women', '#rights'], tags: ['women', 'rights'], description: 'Mumbai rally' }),
      ];
      const result = filterVideos(videos, { ...baseState, query: 'peaceful' });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('matches tags (without hash prefix)', () => {
      const videos = [
        makeVideo({ id: '1', tags: ['peaceful', 'students'], hashtags: ['#peaceful', '#students'], description: 'Delhi protest' }),
        makeVideo({ id: '2', tags: ['women', 'rights'], hashtags: ['#women', '#rights'], description: 'Mumbai rally' }),
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
      makeVideo({ id: '1', category: 'protest-marches', state: 'Delhi', tags: ['peaceful'] }),
      makeVideo({ id: '2', category: 'human-rights', state: 'Delhi', tags: ['peaceful'] }),
      makeVideo({ id: '3', category: 'protest-marches', state: 'Maharashtra', tags: ['peaceful'] }),
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
});
