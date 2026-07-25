/**
 * @file seo.test.ts
 * Unit tests for the {@link siteUrl} utility function.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { siteUrl } from '@/lib/utils';

describe('siteUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    // Clear all VERCEL env vars to test fallback chain
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_BRANCH_URL;
    delete process.env.VERCEL_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.PORT;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns VERCEL_PROJECT_PRODUCTION_URL when set', () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'ispv.vercel.app';
    expect(siteUrl()).toBe('https://ispv.vercel.app');
  });

  it('falls back to VERCEL_BRANCH_URL when production URL is unset', () => {
    process.env.VERCEL_BRANCH_URL = 'branch-123.vercel.app';
    expect(siteUrl()).toBe('https://branch-123.vercel.app');
  });

  it('falls back to VERCEL_URL', () => {
    process.env.VERCEL_URL = 'deploy-preview-1.vercel.app';
    expect(siteUrl()).toBe('https://deploy-preview-1.vercel.app');
  });

  it('falls back to NEXT_PUBLIC_SITE_URL', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'http://custom.example.com';
    expect(siteUrl()).toBe('http://custom.example.com');
  });

  it('falls back to localhost with default port 3001', () => {
    expect(siteUrl()).toBe('http://localhost:3001');
  });

  it('falls back to localhost with custom PORT', () => {
    process.env.PORT = '4000';
    expect(siteUrl()).toBe('http://localhost:4000');
  });

  it('prefers higher-priority env vars over lower-priority ones', () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'production.vercel.app';
    process.env.VERCEL_BRANCH_URL = 'branch.vercel.app';
    process.env.VERCEL_URL = 'deploy.vercel.app';
    expect(siteUrl()).toBe('https://production.vercel.app');
  });

  it('normalizes a URL missing the scheme', () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = 'example.com';
    expect(siteUrl()).toBe('https://example.com');
  });

  it('strips trailing slashes', () => {
    process.env.VERCEL_URL = 'example.com/';
    expect(siteUrl()).toBe('https://example.com');
  });

  it('handles leading whitespace', () => {
    process.env.VERCEL_URL = '  example.com  ';
    expect(siteUrl()).toBe('https://example.com');
  });
});
