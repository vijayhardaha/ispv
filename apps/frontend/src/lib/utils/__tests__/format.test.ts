/**
 * @file format.test.ts
 * Unit tests for number formatting and time-ago utilities.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { formatNumber, timeAgo } from '@/lib/utils';

describe('formatNumber', () => {
  it('formats numbers under 1000 as plain strings', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(1)).toBe('1');
    expect(formatNumber(500)).toBe('500');
    expect(formatNumber(999)).toBe('999');
  });

  it('formats numbers in the thousands with K suffix', () => {
    expect(formatNumber(1000)).toBe('1K');
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(10000)).toBe('10K');
    expect(formatNumber(999000)).toBe('999K');
  });

  it('strips trailing .0 from K values', () => {
    expect(formatNumber(2000)).toBe('2K');
    expect(formatNumber(10000)).toBe('10K');
  });

  it('formats numbers in the millions with M suffix', () => {
    expect(formatNumber(1_000_000)).toBe('1M');
    expect(formatNumber(2_500_000)).toBe('2.5M');
    expect(formatNumber(10_000_000)).toBe('10M');
  });

  it('strips trailing .0 from M values', () => {
    expect(formatNumber(3_000_000)).toBe('3M');
  });

  it('handles large numbers with decimal portions', () => {
    expect(formatNumber(1_234_567)).toBe('1.2M');
    expect(formatNumber(9_999_999)).toBe('10M');
  });
});

describe('timeAgo', () => {
  let restoreDateNow: (() => void) | null = null;

  beforeEach(() => {
    const fixedTime = new Date('2026-07-23T10:00:00.000Z').getTime();
    restoreDateNow = vi.spyOn(Date, 'now').mockImplementation(() => fixedTime);
  });

  afterEach(() => {
    restoreDateNow?.();
  });

  it('returns seconds ago for recent times', () => {
    const iso = new Date('2026-07-23T09:59:50.000Z').toISOString();
    expect(timeAgo(iso)).toBe('10s ago');
  });

  it('returns minutes ago', () => {
    const iso = new Date('2026-07-23T09:55:00.000Z').toISOString();
    expect(timeAgo(iso)).toBe('5m ago');
  });

  it('returns hours ago', () => {
    const iso = new Date('2026-07-23T07:00:00.000Z').toISOString();
    expect(timeAgo(iso)).toBe('3h ago');
  });

  it('returns days ago', () => {
    const iso = new Date('2026-07-20T10:00:00.000Z').toISOString();
    expect(timeAgo(iso)).toBe('3d ago');
  });

  it('returns locale date string for times older than a week', () => {
    const date = new Date('2026-07-01T10:00:00.000Z');
    const iso = date.toISOString();
    const result = timeAgo(iso);
    // Should return a locale-formatted date (not a relative string)
    expect(result).not.toMatch(/[smhd] ago$/);
    expect(result).toBe(date.toLocaleDateString());
  });

  it('handles edge case of exactly 60 seconds (should be 1m ago)', () => {
    const iso = new Date('2026-07-23T09:59:00.000Z').toISOString();
    expect(timeAgo(iso)).toBe('1m ago');
  });

  it('handles edge case of exactly 3600 seconds (should be 1h ago)', () => {
    const iso = new Date('2026-07-23T09:00:00.000Z').toISOString();
    expect(timeAgo(iso)).toBe('1h ago');
  });
});
