import { describe, expect, it } from 'vitest';

import { formatLocationLabel } from '@/helpers/formatLocation';

describe('formatLocationLabel', () => {
  it('returns empty string when both city and location are empty', () => {
    expect(formatLocationLabel('', '')).toBe('');
  });

  it('returns city when location is empty', () => {
    expect(formatLocationLabel('Mumbai', '')).toBe('Mumbai');
  });

  it('returns location name when city is empty and slug matches', () => {
    expect(formatLocationLabel('', 'delhi')).toBe('Delhi');
  });

  it('returns raw location slug when no match found and city is empty', () => {
    expect(formatLocationLabel('', 'unknown-place')).toBe('unknown-place');
  });

  it('deduplicates when city matches location name (case-insensitive)', () => {
    expect(formatLocationLabel('Delhi', 'delhi')).toBe('Delhi');
    expect(formatLocationLabel('delhi', 'delhi')).toBe('delhi');
    expect(formatLocationLabel('DELHI', 'delhi')).toBe('DELHI');
  });

  it('joins city and location with comma when different', () => {
    expect(formatLocationLabel('Indore', 'madhya-pradesh')).toBe('Indore, Madhya Pradesh');
  });

  it('joins city and unmatched slug with comma', () => {
    expect(formatLocationLabel('Mumbai', 'unknown-slug')).toBe('Mumbai, unknown-slug');
  });

  it('handles multi-word city names that differ from location', () => {
    expect(formatLocationLabel('New Delhi', 'delhi')).toBe('New Delhi, Delhi');
  });

  it('handles all LOCATIONS slugs', () => {
    const result = formatLocationLabel('Bhopal', 'madhya-pradesh');
    expect(result).toBe('Bhopal, Madhya Pradesh');
  });
});
