/**
 * @file cn.test.ts
 * Unit tests for the {@link cn} utility function.
 */

import { describe, expect, it } from 'vitest';

import { cn } from '@/lib/utils';

describe('cn', () => {
  it('joins multiple strings with a space', () => {
    expect(cn('px-4', 'py-2', 'text-black')).toBe('px-4 py-2 text-black');
  });

  it('handles conditional class objects', () => {
    expect(cn('px-4', { hidden: true, block: false })).toBe('px-4 hidden');
  });

  it('handles arrays of classes', () => {
    expect(cn(['px-4', 'py-2'], 'text-black')).toBe('px-4 py-2 text-black');
  });

  it('filters out falsy values', () => {
    expect(cn('px-4', undefined, null, false, 'py-2')).toBe('px-4 py-2');
  });

  it('merges conflicting Tailwind classes (last wins)', () => {
    // twMerge should resolve the conflict, keeping the last one
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });

  it('merges padding classes correctly', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8');
  });

  it('merges colour variant overrides', () => {
    expect(cn('bg-blue-500', 'bg-red-500')).toBe('bg-red-500');
  });

  it('returns empty string for no arguments', () => {
    expect(cn()).toBe('');
  });

  it('returns empty string when all values are falsy', () => {
    expect(cn(false, undefined, null)).toBe('');
  });

  it('handles mixed conditional and string inputs', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('btn', isActive && 'btn-active', isDisabled && 'btn-disabled')).toBe('btn btn-active');
  });
});
