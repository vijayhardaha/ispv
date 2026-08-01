/**
 * @file adapt.test.ts
 * Unit tests for DB row to VideoEntry mapping utilities.
 */

import { describe, expect, it } from 'vitest';

import { dbRowToVideoEntry, dbRowsToVideoEntries } from '@/lib/videos';
import type { VideoRow } from '@/lib/videos';

const makeRow = (overrides: Partial<VideoRow> = {}): VideoRow => ({
  id: 'abc-123',
  video_url: 'https://www.instagram.com/p/DEF456/',
  video_id: 'DEF456',
  video_src: 'instagram',
  categories: ['protest-marches'],
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

  it('preserves tags from database row', () => {
    const row = makeRow({ tags: ['peaceful', 'students'] });
    const entry = dbRowToVideoEntry(row);

    expect(entry.tags).toContain('peaceful');
    expect(entry.tags).toContain('students');
  });

  it('handles null tags gracefully', () => {
    const row = makeRow({ tags: null });
    const entry = dbRowToVideoEntry(row);

    expect(entry.tags).toEqual([]);
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

  it('resolves category name from CATEGORIES constant', () => {
    const row = makeRow({ categories: ['protest-marches'] });
    const entry = dbRowToVideoEntry(row);

    expect(entry.categoryName).toBe('Protest Marches');
  });

  it('uses the first category as primary and keeps all categories', () => {
    const row = makeRow({ categories: ['protest-marches', 'human-rights'] });
    const entry = dbRowToVideoEntry(row);

    expect(entry.category).toBe('protest-marches');
    expect(entry.categories).toEqual(['protest-marches', 'human-rights']);
  });

  it('falls back to category value when not found in CATEGORIES', () => {
    const row = makeRow({ categories: ['unknown-category'] });
    const entry = dbRowToVideoEntry(row);

    expect(entry.categoryName).toBe('unknown-category');
  });

  it('determines trending based on view_count > 1000', () => {
    const notTrending = dbRowToVideoEntry(makeRow({ view_count: 500 }));
    expect(notTrending.trending).toBe(false);

    const trending = dbRowToVideoEntry(makeRow({ view_count: 1001 }));
    expect(trending.trending).toBe(true);

    const exactlyThreshold = dbRowToVideoEntry(makeRow({ view_count: 1000 }));
    expect(exactlyThreshold.trending).toBe(false);
  });

  it('handles null view_count', () => {
    const row = makeRow({ view_count: null });
    const entry = dbRowToVideoEntry(row);

    expect(entry.trending).toBe(false);
  });

  it('handles empty tags array', () => {
    const row = makeRow({ tags: [] });
    const entry = dbRowToVideoEntry(row);

    expect(entry.tags).toEqual([]);
  });

  it('handles null city', () => {
    const row = makeRow({ city: null });
    const entry = dbRowToVideoEntry(row);
    expect(entry.city).toBe('');
  });

  it('handles null location', () => {
    const row = makeRow({ location: null });
    const entry = dbRowToVideoEntry(row);
    expect(entry.location).toBe('');
  });

  it('handles null categories', () => {
    const row = makeRow({ categories: null });
    const entry = dbRowToVideoEntry(row);
    expect(entry.category).toBe('');
    expect(entry.categories).toEqual([]);
    expect(entry.categoryName).toBe('');
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
