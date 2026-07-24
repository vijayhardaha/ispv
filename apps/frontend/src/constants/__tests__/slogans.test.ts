import { describe, expect, it } from 'vitest';

import { SLOGANS, SLOGANS_PULL_QUOTES } from '@/constants/slogans';

describe('slogans', () => {
  it('exports non-empty slogans array', () => {
    expect(Array.isArray(SLOGANS)).toBe(true);
    expect(SLOGANS.length).toBeGreaterThan(0);
    expect(typeof SLOGANS[0]).toBe('string');
  });

  it('all slogans are non-empty strings', () => {
    for (const slogan of SLOGANS) {
      expect(typeof slogan).toBe('string');
      expect(slogan.trim().length).toBeGreaterThan(0);
    }
  });

  it('no two slogans are identical', () => {
    expect(new Set(SLOGANS).size).toBe(SLOGANS.length);
  });

  it('exports non-empty pull quotes array', () => {
    expect(Array.isArray(SLOGANS_PULL_QUOTES)).toBe(true);
    expect(SLOGANS_PULL_QUOTES.length).toBeGreaterThan(0);
  });

  it('each pull quote has quote and person fields', () => {
    for (const item of SLOGANS_PULL_QUOTES) {
      expect(item).toHaveProperty('quote');
      expect(item).toHaveProperty('person');
      expect(typeof item.quote).toBe('string');
      expect(typeof item.person).toBe('string');
      expect(item.quote.trim().length).toBeGreaterThan(0);
      expect(item.person.trim().length).toBeGreaterThan(0);
    }
  });

  it('each pull quote has a named person', () => {
    for (const item of SLOGANS_PULL_QUOTES) {
      expect(item.person).toMatch(/\(/); // Should include Hindi transliteration
    }
  });

  it('pull quotes reference notable Indian figures', () => {
    const figures = SLOGANS_PULL_QUOTES.map((q) => q.person);
    expect(figures.some((f) => f.includes('Gandhi'))).toBe(true);
    expect(figures.some((f) => f.includes('Ambedkar'))).toBe(true);
    expect(figures.some((f) => f.includes('Nehru'))).toBe(true);
    expect(figures.some((f) => f.includes('Bose'))).toBe(true);
    expect(figures.some((f) => f.includes('Singh'))).toBe(true);
    expect(figures.some((f) => f.includes('Azad'))).toBe(true);
  });

  it('has at least 20 slogans', () => {
    expect(SLOGANS.length).toBeGreaterThanOrEqual(20);
  });

  it('has at least 10 pull quotes', () => {
    expect(SLOGANS_PULL_QUOTES.length).toBeGreaterThanOrEqual(10);
  });
});
