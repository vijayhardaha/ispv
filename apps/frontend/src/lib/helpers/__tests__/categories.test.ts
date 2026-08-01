/**
 * @file categories.test.ts
 * Unit tests for the category badge resolution helper.
 */

import { describe, expect, it } from 'vitest';

import { getCategoryBadges } from '@/lib/helpers/categories';
import type { VideoEntry } from '@/lib/videos';

const makeVideo = (categories: string[]): VideoEntry => ({
  id: '1',
  description: 'A protest video',
  url: 'https://instagram.com/p/abc/',
  thumbnail: 'https://example.com/thumb.jpg',
  city: 'Delhi',
  location: 'Delhi',
  category: categories[0] ?? '',
  categories,
  categoryName: '',
  tags: [],
  duration: 0,
  viewCount: 0,
  videoPostDate: null,
  createdAt: '2026-01-01T00:00:00Z',
});

describe('getCategoryBadges', () => {
  it('resolves slug to the category display name', () => {
    const result = getCategoryBadges(makeVideo(['police-conduct']));
    expect(result.visibleCategories).toEqual(['Police Conduct']);
    expect(result.extraCount).toBe(0);
  });

  it('shows all categories when two or fewer', () => {
    const result = getCategoryBadges(makeVideo(['police-conduct', 'gen-z-moments']));
    expect(result.visibleCategories).toEqual(['Police Conduct', 'Gen Z Moments']);
    expect(result.extraCount).toBe(0);
  });

  it('truncates to two badges and reports the hidden count', () => {
    const result = getCategoryBadges(makeVideo(['police-conduct', 'gen-z-moments', 'protest-marches']));
    expect(result.visibleCategories).toHaveLength(2);
    expect(result.extraCount).toBe(1);
  });

  it('falls back to the slug when the category is not found', () => {
    const result = getCategoryBadges(makeVideo(['unknown-category']));
    expect(result.visibleCategories).toEqual(['unknown-category']);
  });

  it('handles an empty categories array', () => {
    const result = getCategoryBadges(makeVideo([]));
    expect(result.visibleCategories).toEqual([]);
    expect(result.extraCount).toBe(0);
  });

  it('handles categories beyond the limit with multiple extras', () => {
    const result = getCategoryBadges(makeVideo(['a', 'b', 'c', 'd']));
    expect(result.visibleCategories).toEqual(['a', 'b']);
    expect(result.extraCount).toBe(2);
  });
});
