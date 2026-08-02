/**
 * @file tags.test.ts
 * Unit tests for tag parsing and word-count utilities.
 */

import { describe, expect, it } from 'vitest';

import { countWords, MAX_TAGS, MAX_WORDS, parseTags } from '@/lib/helpers/tags';

describe('parseTags', () => {
  it('splits comma-separated input into trimmed tags', () => {
    expect(parseTags('protest, peaceful, march')).toEqual(['protest', 'peaceful', 'march']);
  });

  it('trims surrounding whitespace from each tag', () => {
    expect(parseTags('  protest ,  peaceful ')).toEqual(['protest', 'peaceful']);
  });

  it('deduplicates repeated tags', () => {
    expect(parseTags('protest, protest, march, protest')).toEqual(['protest', 'march']);
  });

  it('drops empty entries', () => {
    expect(parseTags('protest, ,, march,,')).toEqual(['protest', 'march']);
  });

  it('cleans stray spaces between commas', () => {
    expect(parseTags('demo, , cool')).toEqual(['demo', 'cool']);
  });

  it('returns empty array for empty input', () => {
    expect(parseTags('')).toEqual([]);
  });

  it('returns empty array for whitespace-only input', () => {
    expect(parseTags('   ')).toEqual([]);
  });
});

describe('countWords', () => {
  it('counts single words across tags', () => {
    expect(countWords(['protest', 'march'])).toBe(2);
  });

  it('counts multi-word tags', () => {
    expect(countWords(['peaceful protest', 'student rights'])).toBe(4);
  });

  it('returns 0 for an empty array', () => {
    expect(countWords([])).toBe(0);
  });

  it('ignores blank entries within tags', () => {
    expect(countWords(['peaceful  protest', '  '])).toBe(2);
  });
});

describe('constants', () => {
  it('defines the max tag count', () => {
    expect(MAX_TAGS).toBe(15);
  });

  it('defines the max word count', () => {
    expect(MAX_WORDS).toBe(50);
  });
});
