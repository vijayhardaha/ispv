/**
 * @file instagram.test.ts
 * Unit tests for the Instagram URL extraction utility.
 */

import { describe, expect, it } from 'vitest';

import { extractInstagramId } from '@/lib/utils';

describe('extractInstagramId', () => {
  it('extracts ID from a standard post URL', () => {
    expect(extractInstagramId('https://www.instagram.com/p/ABC123xyz/')).toBe('ABC123xyz');
  });

  it('extracts ID from a reel URL', () => {
    expect(extractInstagramId('https://www.instagram.com/reel/DEF456abc/')).toBe('DEF456abc');
  });

  it('extracts ID from a reels URL (plural)', () => {
    expect(extractInstagramId('https://www.instagram.com/reels/GHI789mno/')).toBe('GHI789mno');
  });

  it('extracts ID from a URL without www prefix', () => {
    expect(extractInstagramId('https://instagram.com/p/JKL012pqr/')).toBe('JKL012pqr');
  });

  it('extracts IDs with hyphens and underscores', () => {
    expect(extractInstagramId('https://www.instagram.com/p/AbC-123_xyZ/')).toBe('AbC-123_xyZ');
  });

  it('returns null for non-Instagram URLs', () => {
    expect(extractInstagramId('https://youtube.com/watch?v=12345')).toBeNull();
  });

  it('returns null for Instagram profile URLs', () => {
    expect(extractInstagramId('https://www.instagram.com/username/')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(extractInstagramId('')).toBeNull();
  });

  it('returns null for malformed Instagram URLs (no media ID)', () => {
    expect(extractInstagramId('https://www.instagram.com/p/')).toBeNull();
  });

  it('handles URLs with query parameters', () => {
    expect(extractInstagramId('https://www.instagram.com/p/ABC123xyz/?utm_source=ig_web_copy_link')).toBe('ABC123xyz');
  });
});
