import { describe, expect, it } from 'vitest';

import { DEMANDS, SOURCES } from '@/constants/why-protest-data';

describe('demands', () => {
  it('exports non-empty demands array', () => {
    expect(Array.isArray(DEMANDS)).toBe(true);
    expect(DEMANDS.length).toBeGreaterThan(0);
  });

  it('each demand has the correct shape', () => {
    for (const demand of DEMANDS) {
      expect(demand).toHaveProperty('title');
      expect(demand).toHaveProperty('color');
      expect(demand).toHaveProperty('icon');
      expect(demand).toHaveProperty('body');
      expect(typeof demand.title).toBe('string');
      expect(typeof demand.color).toBe('string');
      expect(typeof demand.body).toBe('string');
      expect(demand.title.trim().length).toBeGreaterThan(0);
      expect(demand.body.trim().length).toBeGreaterThan(0);
    }
  });

  it('each demand has a unique title', () => {
    const titles = DEMANDS.map((d) => d.title.toLowerCase());
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('all demands use valid Tailwind background colour classes', () => {
    for (const demand of DEMANDS) {
      expect(demand.color).toMatch(/^bg-\w+-\d+$/);
    }
  });

  it('has at least 4 demands', () => {
    expect(DEMANDS.length).toBeGreaterThanOrEqual(4);
  });
});

describe('sources', () => {
  it('exports non-empty sources array', () => {
    expect(Array.isArray(SOURCES)).toBe(true);
    expect(SOURCES.length).toBeGreaterThan(0);
  });

  it('each source has the correct shape', () => {
    for (const source of SOURCES) {
      expect(source).toHaveProperty('title');
      expect(source).toHaveProperty('url');
      expect(source).toHaveProperty('description');
      expect(typeof source.title).toBe('string');
      expect(typeof source.url).toBe('string');
      expect(typeof source.description).toBe('string');
      expect(source.title.trim().length).toBeGreaterThan(0);
      expect(source.url.trim().length).toBeGreaterThan(0);
      expect(source.description.trim().length).toBeGreaterThan(0);
    }
  });

  it('source URLs are valid', () => {
    for (const source of SOURCES) {
      expect(source.url).toMatch(/^https?:\/\//);
    }
  });

  it('has at least 2 sources', () => {
    expect(SOURCES.length).toBeGreaterThanOrEqual(2);
  });
});
