/**
 * @file schemas.test.ts
 * Unit tests for the admin Zod validation schemas.
 */

import { describe, expect, it } from 'vitest';

import { enrichVideoBodySchema, submitVideoBodySchema, videoFormSchema } from '../schemas';

describe('submitVideoBodySchema', () => {
  it('accepts a minimal valid submission', () => {
    const result = submitVideoBodySchema.safeParse({ video_url: 'https://instagram.com/reel/abc' });
    expect(result.success).toBe(true);
  });

  it('rejects a submission without a video_url', () => {
    const result = submitVideoBodySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects an empty video_url with the required message', () => {
    const result = submitVideoBodySchema.safeParse({ video_url: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('video_url is required');
    }
  });

  it('rejects more than three categories', () => {
    const result = submitVideoBodySchema.safeParse({
      video_url: 'https://instagram.com/reel/abc',
      categories: ['a', 'b', 'c', 'd'],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Select up to 3 categories');
    }
  });

  it('allows up to three categories', () => {
    const result = submitVideoBodySchema.safeParse({
      video_url: 'https://instagram.com/reel/abc',
      categories: ['a', 'b', 'c'],
    });
    expect(result.success).toBe(true);
  });

  it('trims whitespace from tags and drops empty entries', () => {
    const result = submitVideoBodySchema.safeParse({
      video_url: 'https://instagram.com/reel/abc',
      tags: ['  protest ', '', '  ', 'peaceful'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual(['protest', 'peaceful']);
    }
  });

  it('capitalizes the city name', () => {
    const result = submitVideoBodySchema.safeParse({
      video_url: 'https://instagram.com/reel/abc',
      city: '  new delhi ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.city).toBe('New Delhi');
    }
  });

  it('keeps nullish city and tags untouched', () => {
    const result = submitVideoBodySchema.safeParse({
      video_url: 'https://instagram.com/reel/abc',
      city: null,
      tags: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.city).toBeNull();
      expect(result.data.tags).toBeNull();
    }
  });
});

describe('enrichVideoBodySchema', () => {
  it('accepts a valid enrichment body', () => {
    const result = enrichVideoBodySchema.safeParse({
      video_url: 'https://instagram.com/reel/abc',
      video_post_date: '2026-07-01T10:00:00Z',
      og_image: 'https://example.com/og.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a body without a video_url', () => {
    const result = enrichVideoBodySchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('accepts null optional fields', () => {
    const result = enrichVideoBodySchema.safeParse({
      video_url: 'https://instagram.com/reel/abc',
      video_post_date: null,
      og_image: null,
    });
    expect(result.success).toBe(true);
  });
});

describe('videoFormSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    const result = videoFormSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts a fully populated form', () => {
    const result = videoFormSchema.safeParse({
      video_url: 'https://instagram.com/reel/abc',
      video_id: 'abc',
      video_src: 'instagram',
      categories: ['police-conduct', 'gen-z-moments'],
      location: 'delhi',
      city: 'new delhi',
      tags: ['protest', 'peaceful'],
      description: 'A protest march',
      status: 'published',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.city).toBe('New Delhi');
      expect(result.data.tags).toEqual(['protest', 'peaceful']);
    }
  });

  it('rejects an invalid status value', () => {
    const result = videoFormSchema.safeParse({ status: 'invalid-status' });
    expect(result.success).toBe(false);
  });

  it('trims tags and drops empty entries', () => {
    const result = videoFormSchema.safeParse({ tags: ['  a ', '', ' b'] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual(['a', 'b']);
    }
  });
});
