/**
 * @file format.test.ts
 * Unit tests for the {@link capitalizeCity} utility function.
 */

import { describe, expect, it } from 'vitest';

import { capitalizeCity } from '@/lib/utils';

describe('capitalizeCity', () => {
  it('trims surrounding whitespace and title-cases a single word', () => {
    expect(capitalizeCity('  mumbai  ')).toBe('Mumbai');
  });

  it('title-cases multi-word city names', () => {
    expect(capitalizeCity('new delhi')).toBe('New Delhi');
  });

  it('normalizes already-mixed casing', () => {
    expect(capitalizeCity('NeW DeLhI')).toBe('New Delhi');
  });

  it('collapses internal whitespace runs', () => {
    expect(capitalizeCity('mumbai   city')).toBe('Mumbai City');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(capitalizeCity('   ')).toBe('');
  });

  it('returns empty string for empty input', () => {
    expect(capitalizeCity('')).toBe('');
  });
});
