import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { getPermaLink, siteUrl } from '../seo';

describe('seo utils', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('siteUrl', () => {
    it('returns VERCEL_PROJECT_PRODUCTION_URL with https scheme if set', () => {
      process.env.VERCEL_PROJECT_PRODUCTION_URL = 'example.com';
      expect(siteUrl()).toBe('https://example.com');
    });

    it('returns VERCEL_BRANCH_URL when production URL is not set', () => {
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
      process.env.VERCEL_BRANCH_URL = 'https://branch.example.com/';
      expect(siteUrl()).toBe('https://branch.example.com');
    });

    it('returns VERCEL_URL when branch URL is not set', () => {
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
      delete process.env.VERCEL_BRANCH_URL;
      process.env.VERCEL_URL = 'vercel.app';
      expect(siteUrl()).toBe('https://vercel.app');
    });

    it('returns NEXT_PUBLIC_SITE_URL when vercel URLs are not set', () => {
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
      delete process.env.VERCEL_BRANCH_URL;
      delete process.env.VERCEL_URL;
      process.env.NEXT_PUBLIC_SITE_URL = 'http://custom-domain.org/';
      expect(siteUrl()).toBe('http://custom-domain.org');
    });

    it('defaults to localhost with PORT env var', () => {
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
      delete process.env.VERCEL_BRANCH_URL;
      delete process.env.VERCEL_URL;
      delete process.env.NEXT_PUBLIC_SITE_URL;
      process.env.PORT = '4000';
      expect(siteUrl()).toBe('http://localhost:4000');
    });

    it('defaults to localhost:3000 when no env vars are set', () => {
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
      delete process.env.VERCEL_BRANCH_URL;
      delete process.env.VERCEL_URL;
      delete process.env.NEXT_PUBLIC_SITE_URL;
      delete process.env.PORT;
      expect(siteUrl()).toBe('http://localhost:3000');
    });
  });

  describe('getPermaLink', () => {
    beforeEach(() => {
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
      delete process.env.VERCEL_BRANCH_URL;
      delete process.env.VERCEL_URL;
      process.env.NEXT_PUBLIC_SITE_URL = 'https://site.com';
    });

    it('returns base url when path is empty or slash', () => {
      expect(getPermaLink('')).toBe('https://site.com');
      expect(getPermaLink('/')).toBe('https://site.com');
    });

    it('formats path correctly with leading/trailing slashes', () => {
      expect(getPermaLink('about')).toBe('https://site.com/about');
      expect(getPermaLink('/about')).toBe('https://site.com/about');
      expect(getPermaLink('/about/')).toBe('https://site.com/about');
    });
  });
});
