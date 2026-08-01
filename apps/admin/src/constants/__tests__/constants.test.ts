import { describe, expect, it } from 'vitest';

import { CATEGORIES } from '../categories';
import { COLORS, TAG_VARIANTS } from '../colors';
import { LOCATIONS } from '../locations';
import { type NavLink, SIDEBAR_NAV_LINKS } from '../navlinks';
import { SITE_CONFIG, SITE_METADATA } from '../seo';

describe('TagVariant & COLORS', () => {
  it('defines all 18 tag variant colors with their Tailwind classes', () => {
    expect(TAG_VARIANTS.amber).toBe('bg-amber-500 text-black');
    expect(TAG_VARIANTS.blue).toBe('bg-blue-600 text-white');
    expect(TAG_VARIANTS.cyan).toBe('bg-cyan-700 text-white');
    expect(TAG_VARIANTS.emerald).toBe('bg-emerald-600 text-white');
    expect(TAG_VARIANTS.fuchsia).toBe('bg-fuchsia-600 text-white');
    expect(TAG_VARIANTS.green).toBe('bg-green-600 text-white');
    expect(TAG_VARIANTS.indigo).toBe('bg-indigo-600 text-white');
    expect(TAG_VARIANTS.lime).toBe('bg-lime-500 text-black');
    expect(TAG_VARIANTS.orange).toBe('bg-orange-500 text-black');
    expect(TAG_VARIANTS.pink).toBe('bg-pink-600 text-white');
    expect(TAG_VARIANTS.purple).toBe('bg-purple-600 text-white');
    expect(TAG_VARIANTS.red).toBe('bg-red-500 text-white');
    expect(TAG_VARIANTS.rose).toBe('bg-rose-600 text-white');
    expect(TAG_VARIANTS.sky).toBe('bg-sky-700 text-white');
    expect(TAG_VARIANTS.teal).toBe('bg-teal-600 text-white');
    expect(TAG_VARIANTS.violet).toBe('bg-violet-600 text-white');
    expect(TAG_VARIANTS.yellow).toBe('bg-yellow-400 text-black');
    expect(TAG_VARIANTS.slate).toBe('bg-slate-600 text-white');
  });

  it('derives COLORS from TAG_VARIANTS keys with no duplicates', () => {
    expect(COLORS).toHaveLength(18);
    expect(new Set(COLORS).size).toBe(COLORS.length);
  });

  it('every COLORS entry is a valid TagVariant and exists in TAG_VARIANTS', () => {
    for (const color of COLORS) {
      expect(TAG_VARIANTS[color]).toBeDefined();
    }
  });

  it('COLORS array matches TAG_VARIANTS keys exactly', () => {
    expect(COLORS.sort()).toEqual(Object.keys(TAG_VARIANTS).sort());
  });
});

describe('NavLink & SIDEBAR_NAV_LINKS', () => {
  it('defines exactly 2 sidebar navigation links', () => {
    expect(SIDEBAR_NAV_LINKS).toHaveLength(2);
  });

  it('each nav link has the correct NavLink shape', () => {
    for (const link of SIDEBAR_NAV_LINKS) {
      expect(link).toHaveProperty('label');
      expect(link).toHaveProperty('href');
      expect(typeof link.label).toBe('string');
      expect(typeof link.href).toBe('string');
    }
  });

  it('first link points to Dashboard', () => {
    expect(SIDEBAR_NAV_LINKS[0]).toEqual<NavLink>({ label: 'Dashboard', href: '/' });
  });

  it('second link points to Videos', () => {
    expect(SIDEBAR_NAV_LINKS[1]).toEqual<NavLink>({ label: 'Videos', href: '/videos' });
  });

  it('all hrefs start with /', () => {
    for (const link of SIDEBAR_NAV_LINKS) {
      expect(link.href).toMatch(/^\//);
    }
  });

  it('no duplicate labels or hrefs', () => {
    const labels = SIDEBAR_NAV_LINKS.map((l) => l.label);
    const hrefs = SIDEBAR_NAV_LINKS.map((l) => l.href);
    expect(new Set(labels).size).toBe(labels.length);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});

describe('SITE_CONFIG & SITE_METADATA', () => {
  it('defines site config with expected values', () => {
    expect(SITE_CONFIG.name).toBe('ISPV Admin');
    expect(SITE_CONFIG.title).toBe('ISPV Admin — Video Archive Management');
    expect(SITE_CONFIG.description).toBe('Admin panel for managing the Indian Students Protest Vault archive.');
    expect(SITE_CONFIG.creator.name).toBe('Vijay Hardaha');
  });

  it('metadata includes application name matching site config', () => {
    expect(SITE_METADATA.applicationName).toBe(SITE_CONFIG.name);
  });

  it('metadata sets robots to noindex nofollow', () => {
    expect(SITE_METADATA.robots).toEqual({ index: false, follow: false });
  });

  it('metadata title template includes site name', () => {
    expect(SITE_METADATA.title).toEqual(
      expect.objectContaining({ default: SITE_CONFIG.name, template: expect.stringContaining(SITE_CONFIG.name) })
    );
  });

  it('metadata defines openGraph with required fields', () => {
    expect(SITE_METADATA.openGraph).toBeDefined();
    const og = SITE_METADATA.openGraph as Record<string, unknown>;
    expect(og.title).toBe(SITE_CONFIG.title);
    expect(og.description).toBe(SITE_CONFIG.description);
    expect(og.type).toBe('website');
    expect(og.locale).toBe('en_US');
  });

  it('metadata defines twitter card', () => {
    expect(SITE_METADATA.twitter).toBeDefined();
    const tw = SITE_METADATA.twitter as Record<string, unknown>;
    expect(tw.card).toBe('summary_large_image');
    expect(tw.creator).toBe('@vijayhardaha');
  });
});

describe('CATEGORIES', () => {
  it('has at least 10 categories', () => {
    expect(CATEGORIES.length).toBeGreaterThanOrEqual(10);
  });

  it('every category has the correct CategoryRecord shape', () => {
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
    }
  });

  it('has unique slugs across all categories', () => {
    const slugs = CATEGORIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('every category color is a recognized color string', () => {
    for (const cat of CATEGORIES) {
      expect(COLORS).toContain(cat.color);
    }
  });

  it('every category has a non-empty description', () => {
    for (const cat of CATEGORIES) {
      expect(cat.description).toBeTruthy();
    }
  });

  it('includes core categories', () => {
    const slugs = CATEGORIES.map((c) => c.slug);
    expect(slugs).toContain('protest-marches');
    expect(slugs).toContain('police-conduct');
    expect(slugs).toContain('gen-z-moments');
    expect(slugs).toContain('news-coverage');
  });

  it('has slug and name aligned (slug derived from name)', () => {
    for (const cat of CATEGORIES) {
      if (cat.slug === 'other') continue; // special case
      const expectedPrefix = cat.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      expect(cat.slug.startsWith(expectedPrefix.slice(0, 5))).toBe(true);
    }
  });
});

describe('LOCATIONS', () => {
  it('has at least 30 locations', () => {
    expect(LOCATIONS.length).toBeGreaterThanOrEqual(30);
  });

  it('every location has the correct LocationRecord shape', () => {
    for (const loc of LOCATIONS) {
      expect(loc).toHaveProperty('slug');
      expect(loc).toHaveProperty('name');
      expect(typeof loc.slug).toBe('string');
      expect(typeof loc.name).toBe('string');
    }
  });

  it('has unique slugs across all locations', () => {
    const slugs = LOCATIONS.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('includes major locations', () => {
    const slugs = LOCATIONS.map((l) => l.slug);
    expect(slugs).toContain('delhi');
    expect(slugs).toContain('maharashtra');
    expect(slugs).toContain('uttar-pradesh');
    expect(slugs).toContain('foreign');
  });

  it('Delhi is the first location', () => {
    expect(LOCATIONS[0].slug).toBe('delhi');
    expect(LOCATIONS[0].name).toBe('Delhi');
  });
});
