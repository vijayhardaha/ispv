import { describe, expect, it } from 'vitest';

import { TAG_VARIANTS, COLORS } from '../colors';
import { HEADER_NAV_LINKS } from '../navlinks';
import { SITE_CONFIG, SITE_METADATA } from '../seo';

describe('admin constants', () => {
  it('defines valid tag variants and colors array', () => {
    expect(TAG_VARIANTS.blue).toBe('bg-blue-600 text-white');
    expect(COLORS).toContain('blue');
    expect(COLORS).toContain('yellow');
    expect(COLORS).toContain('red');
    expect(COLORS).toContain('green');
    expect(COLORS).toContain('black');
    expect(COLORS).toContain('white');
  });

  it('defines header nav links', () => {
    expect(HEADER_NAV_LINKS).toHaveLength(2);
    expect(HEADER_NAV_LINKS[0]).toEqual({ label: 'Dashboard', href: '/' });
    expect(HEADER_NAV_LINKS[1]).toEqual({ label: 'Videos', href: '/videos' });
  });

  it('defines site config and metadata', () => {
    expect(SITE_CONFIG.name).toBe('ISPV Admin');
    expect(SITE_METADATA.applicationName).toBe('ISPV Admin');
    expect(SITE_METADATA.robots).toEqual({ index: false, follow: false });
  });
});
