/**
 * @file adapt.test.ts
 * Unit tests for DB row to VideoEntry mapping utilities.
 */

import { describe, expect, it } from 'vitest';

import { dbRowToVideoEntry, dbRowsToVideoEntries } from '@/lib/adapt';
import type { VideoRow } from '@/lib/adapt';

const makeRow = (overrides: Partial<VideoRow> = {}): VideoRow => ({
  id: 'abc-123',
  video_url: 'https://www.instagram.com/p/DEF456/',
  video_id: 'DEF456',
  video_src: 'instagram',
  category: 'protest-marches',
  location: 'Delhi',
  city: 'New Delhi',
  tags: ['peaceful', 'students'],
  description: 'Students marching peacefully in New Delhi',
  thumbnail_url: 'https://example.com/thumb.jpg',
  video_post_date: '2026-07-01T10:00:00Z',
  view_count: 500,
  status: 'published',
  created_at: '2026-07-01T10:00:00Z',
  updated_at: '2026-07-01T10:00:00Z',
  categories: { name: 'Protest Marches', color: 'blue' },
  ...overrides,
});

describe('dbRowToVideoEntry', () => {
  it('maps all fields correctly', () => {
    const row = makeRow();
    const entry = dbRowToVideoEntry(row);

    expect(entry.id).toBe('abc-123');
    expect(entry.url).toBe('https://www.instagram.com/p/DEF456/');
    expect(entry.thumbnail).toBe('https://example.com/thumb.jpg');
    expect(entry.city).toBe('New Delhi');
    expect(entry.location).toBe('Delhi');
    expect(entry.category).toBe('protest-marches');
    expect(entry.categoryName).toBe('Protest Marches');
    expect(entry.description).toBe('Students marching peacefully in New Delhi');
    expect(entry.duration).toBe(0);
  });

  it('generates hashtags from tags and city', () => {
    const row = makeRow({ tags: ['peaceful', 'students'], city: 'New Delhi' });
    const entry = dbRowToVideoEntry(row);

    expect(entry.hashtags).toContain('#peaceful');
    expect(entry.hashtags).toContain('#students');
    expect(entry.hashtags).toContain('#NewDelhi'); // spaces stripped
  });

  it('deduplicates hashtags', () => {
    const row = makeRow({ tags: ['delhi'], city: 'Delhi' });
    const entry = dbRowToVideoEntry(row);

    // Both tag 'delhi' and city 'Delhi' produce #Delhi, it should appear once
    const delhiHits = entry.hashtags.filter((h) => h === '#Delhi');
    expect(delhiHits).toHaveLength(1);
  });

  it('handles null tags gracefully', () => {
    const row = makeRow({ tags: null });
    const entry = dbRowToVideoEntry(row);

    expect(entry.tags).toEqual([]);
    expect(entry.hashtags.length).toBeGreaterThanOrEqual(1); // at least city hashtag
  });

  it('handles null description', () => {
    const row = makeRow({ description: null });
    const entry = dbRowToVideoEntry(row);

    expect(entry.description).toBe('');
  });

  it('handles null thumbnail', () => {
    const row = makeRow({ thumbnail_url: null });
    const entry = dbRowToVideoEntry(row);

    expect(entry.thumbnail).toBe('');
  });

  it('handles null categories (falls back to category value)', () => {
    const row = makeRow({ categories: null, category: 'human-rights' });
    const entry = dbRowToVideoEntry(row);

    expect(entry.categoryName).toBe('human-rights');
  });

  it('determines featured based on view_count > 1000', () => {
    const notFeatured = dbRowToVideoEntry(makeRow({ view_count: 500 }));
    expect(notFeatured.featured).toBe(false);

    const featured = dbRowToVideoEntry(makeRow({ view_count: 1001 }));
    expect(featured.featured).toBe(true);

    const exactlyThreshold = dbRowToVideoEntry(makeRow({ view_count: 1000 }));
    expect(exactlyThreshold.featured).toBe(false);
  });

  it('handles null view_count', () => {
    const row = makeRow({ view_count: null });
    const entry = dbRowToVideoEntry(row);

    expect(entry.featured).toBe(false);
  });

  it('handles empty city for hashtag generation', () => {
    const row = makeRow({ city: '', tags: [] });
    const entry = dbRowToVideoEntry(row);

    expect(entry.hashtags).toEqual([]);
  });
});

describe('dbRowsToVideoEntries', () => {
  it('maps an array of rows', () => {
    const rows = [makeRow({ id: '1' }), makeRow({ id: '2' })];
    const entries = dbRowsToVideoEntries(rows);

    expect(entries).toHaveLength(2);
    expect(entries[0].id).toBe('1');
    expect(entries[1].id).toBe('2');
  });

  it('returns empty array for empty input', () => {
    expect(dbRowsToVideoEntries([])).toEqual([]);
  });
});
