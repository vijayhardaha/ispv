/**
 * @file cn.test.ts
 * Unit tests for the {@link cn} utility function.
 */

import { describe, expect, it } from 'vitest';

import { cn } from '@/lib/utils';

describe('cn', () => {
  it('joins multiple truthy strings with a space', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz');
  });

  it('filters out undefined values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar');
  });

  it('filters out null values', () => {
    expect(cn('foo', null, 'bar')).toBe('foo bar');
  });

  it('filters out false values', () => {
    expect(cn('foo', false, 'bar')).toBe('foo bar');
  });

  it('filters out all falsy types in mixed input', () => {
    expect(cn('a', undefined, 'b', null, 'c', false)).toBe('a b c');
  });

  it('returns empty string for no arguments', () => {
    expect(cn()).toBe('');
  });

  it('returns empty string when all values are falsy', () => {
    expect(cn(undefined, null, false)).toBe('');
  });

  it('handles a single truthy argument', () => {
    expect(cn('only')).toBe('only');
  });

  it('handles class names with dashes and colons', () => {
    expect(cn('sm:w-full', 'hover:bg-blue-600')).toBe('sm:w-full hover:bg-blue-600');
  });
});
