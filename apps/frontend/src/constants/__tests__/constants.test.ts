import { describe, expect, it } from 'vitest';

import { CATEGORIES, FEATURED_CATEGORIES_SLUGS } from '@/constants/categories';
import { toneMap, type Tone } from '@/constants/colors';
import { LOCATIONS } from '@/constants/locations';
import {
  FOOTER_BOTTOM_LINKS,
  FOOTER_INFO_LINKS,
  FOOTER_RESOURCE_LINKS,
  FOOTER_USEFUL_LINKS,
  HEADER_NAV_LINKS,
} from '@/constants/navlinks';
import { GOOGLE_ANALYTICS_ID, SITE_CONFIG, SITE_METADATA } from '@/constants/seo';

describe('colors', () => {
  it('has toneMap entries for all defined tones', () => {
    expect(toneMap.blue).toBe('bg-blue-600 text-white');
    expect(toneMap.yellow).toBe('bg-yellow-400 text-black');
    expect(toneMap.red).toBe('bg-red-500 text-white');
    expect(toneMap.green).toBe('bg-green-600 text-white');
    expect(toneMap.black).toBe('bg-black text-white');
    expect(toneMap.white).toBe('bg-white text-black');
  });

  it('has all Tone keys covered in toneMap', () => {
    const tones: Tone[] = ['blue', 'yellow', 'red', 'green', 'black', 'white'];
    for (const tone of tones) {
      expect(toneMap[tone]).toBeDefined();
      expect(toneMap[tone]).toEqual(expect.any(String));
    }
  });

  it('has unique toneMap values', () => {
    const values = Object.values(toneMap);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe('categories', () => {
  it('exports all categories', () => {
    expect(Array.isArray(CATEGORIES)).toBe(true);
    expect(CATEGORIES.length).toBeGreaterThan(0);
  });

  it('each category has the correct shape', () => {
    for (const cat of CATEGORIES) {
      expect(cat).toHaveProperty('slug');
      expect(cat).toHaveProperty('name');
      expect(cat).toHaveProperty('tag');
      expect(cat).toHaveProperty('color');
      expect(cat).toHaveProperty('description');
      expect(typeof cat.slug).toBe('string');
      expect(typeof cat.name).toBe('string');
      expect(typeof cat.tag).toBe('string');
      expect(typeof cat.color).toBe('string');
      expect(cat.description === null || typeof cat.description === 'string').toBe(true);
    }
  });

  it('has unique category slugs', () => {
    const slugs = CATEGORIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('each category has a non-empty name', () => {
    for (const cat of CATEGORIES) {
      expect(cat.name.trim().length).toBeGreaterThan(0);
    }
  });

  it('exports featured category slugs within the defined categories', () => {
    expect(Array.isArray(FEATURED_CATEGORIES_SLUGS)).toBe(true);
    expect(FEATURED_CATEGORIES_SLUGS.length).toBeGreaterThan(0);
    const categorySlugs = new Set(CATEGORIES.map((c) => c.slug));
    for (const slug of FEATURED_CATEGORIES_SLUGS) {
      expect(categorySlugs.has(slug)).toBe(true);
    }
  });

  it('featured slugs are unique', () => {
    expect(new Set(FEATURED_CATEGORIES_SLUGS).size).toBe(FEATURED_CATEGORIES_SLUGS.length);
  });
});

describe('locations', () => {
  it('exports all locations', () => {
    expect(Array.isArray(LOCATIONS)).toBe(true);
    expect(LOCATIONS.length).toBeGreaterThan(0);
  });

  it('each location has the correct shape', () => {
    for (const loc of LOCATIONS) {
      expect(loc).toHaveProperty('slug');
      expect(loc).toHaveProperty('name');
      expect(typeof loc.slug).toBe('string');
      expect(typeof loc.name).toBe('string');
    }
  });

  it('has unique location slugs', () => {
    const slugs = LOCATIONS.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('each location has a non-empty name', () => {
    for (const loc of LOCATIONS) {
      expect(loc.name.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('navlinks', () => {
  it('defines header nav links correctly', () => {
    expect(HEADER_NAV_LINKS).toHaveLength(4);
    expect(HEADER_NAV_LINKS[0]).toEqual({ label: 'Why Protest', href: '/why-students-are-protesting' });
    expect(HEADER_NAV_LINKS[1]).toEqual({ label: 'All Videos', href: '/videos' });
    expect(HEADER_NAV_LINKS[2]).toEqual({ label: 'Categories', href: '/categories' });
    expect(HEADER_NAV_LINKS[3]).toEqual({ label: 'About', href: '/about' });
  });

  it('each header nav link has the NavLink shape', () => {
    for (const link of HEADER_NAV_LINKS) {
      expect(link).toHaveProperty('label');
      expect(link).toHaveProperty('href');
      expect(typeof link.label).toBe('string');
      expect(typeof link.href).toBe('string');
    }
  });

  it('header nav links have unique hrefs', () => {
    const hrefs = HEADER_NAV_LINKS.map((l) => l.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('defines footer info links', () => {
    expect(Array.isArray(FOOTER_INFO_LINKS)).toBe(true);
    expect(FOOTER_INFO_LINKS.length).toBeGreaterThan(0);
    for (const link of FOOTER_INFO_LINKS) {
      expect(link).toHaveProperty('label');
      expect(link).toHaveProperty('href');
      expect(typeof link.label).toBe('string');
      expect(typeof link.href).toBe('string');
    }
  });

  it('footer info links have unique hrefs', () => {
    const hrefs = FOOTER_INFO_LINKS.map((l) => l.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('defines footer useful links', () => {
    expect(Array.isArray(FOOTER_USEFUL_LINKS)).toBe(true);
    expect(FOOTER_USEFUL_LINKS.length).toBeGreaterThan(0);
    for (const link of FOOTER_USEFUL_LINKS) {
      expect(link).toHaveProperty('label');
      expect(link).toHaveProperty('href');
      // Useful links point to external URLs
      expect(link.href).toMatch(/^https?:\/\//);
    }
  });

  it('defines footer resource links', () => {
    expect(Array.isArray(FOOTER_RESOURCE_LINKS)).toBe(true);
    expect(FOOTER_RESOURCE_LINKS.length).toBeGreaterThan(0);
    for (const link of FOOTER_RESOURCE_LINKS) {
      expect(link).toHaveProperty('label');
      expect(link).toHaveProperty('href');
      expect(link.href).toMatch(/^https?:\/\//);
    }
  });

  it('defines footer bottom links', () => {
    expect(FOOTER_BOTTOM_LINKS).toHaveLength(4);
    for (const link of FOOTER_BOTTOM_LINKS) {
      expect(link).toHaveProperty('label');
      expect(link).toHaveProperty('href');
    }
  });

  it('footer bottom links have unique hrefs', () => {
    const hrefs = FOOTER_BOTTOM_LINKS.map((l) => l.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('footer info links overlap with header nav links on common pages', () => {
    const infoHrefs = FOOTER_INFO_LINKS.map((l) => l.href);
    expect(infoHrefs).toContain('/about');
    expect(infoHrefs).toContain('/categories');
    expect(infoHrefs).toContain('/videos');
  });
});

describe('seo', () => {
  it('defines site config with required fields', () => {
    expect(SITE_CONFIG.name).toBe('Indian Students Protest Vault');
    expect(SITE_CONFIG.title).toContain('Indian Students Protest Vault');
    expect(SITE_CONFIG.url).toMatch(/^https?:\/\//);
    expect(SITE_CONFIG.description.length).toBeGreaterThan(0);
    expect(SITE_CONFIG.category).toBe('Archives');
    expect(SITE_CONFIG.organization).toHaveProperty('name');
    expect(SITE_CONFIG.organization).toHaveProperty('description');
  });

  it('defines site metadata with required next/metadata fields', () => {
    expect(SITE_METADATA).toHaveProperty('applicationName');
    expect(SITE_METADATA.applicationName).toBe('Indian Students Protest Vault');
    expect(SITE_METADATA).toHaveProperty('creator');
    expect(SITE_METADATA).toHaveProperty('publisher');
    expect(SITE_METADATA).toHaveProperty('robots');
    expect(SITE_METADATA).toHaveProperty('openGraph');
    expect(SITE_METADATA).toHaveProperty('twitter');
    expect(SITE_METADATA).toHaveProperty('icons');
  });

  it('metadata has Open Graph configuration', () => {
    const og = SITE_METADATA.openGraph;
    expect(og).toBeDefined();
  });

  it('metadata has Twitter card configuration', () => {
    const twitter = SITE_METADATA.twitter;
    expect(twitter).toBeDefined();
    if (twitter && typeof twitter === 'object') {
      expect(twitter).toHaveProperty('card');
    }
  });

  it('google analytics id is disabled by default', () => {
    expect(GOOGLE_ANALYTICS_ID).toBe('');
  });
});
