import { describe, expect, it } from 'vitest';

import { SLOGANS, SLOGANS_PULL_QUOTES } from '@/constants/slogans';

describe('slogans data', () => {
  it('exports non-empty slogans array', () => {
    expect(Array.isArray(SLOGANS)).toBe(true);
    expect(SLOGANS.length).toBeGreaterThan(0);
    expect(typeof SLOGANS[0]).toBe('string');
  });

  it('exports non-empty slogans pull quotes with quote and person', () => {
    expect(Array.isArray(SLOGANS_PULL_QUOTES)).toBe(true);
    expect(SLOGANS_PULL_QUOTES.length).toBeGreaterThan(0);
    expect(SLOGANS_PULL_QUOTES[0]).toHaveProperty('quote');
    expect(SLOGANS_PULL_QUOTES[0]).toHaveProperty('person');
  });
});
