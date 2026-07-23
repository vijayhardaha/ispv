import { describe, expect, it } from 'vitest';

import { toneMap } from '../colors';
import { HEADER_NAV_LINKS } from '../navlinks';
import { SITE_CONFIG, SITE_METADATA } from '../seo';

describe('frontend constants', () => {
  it('has toneMap entries for all defined tones', () => {
    expect(toneMap.default).toBe('bg-white');
    expect(toneMap.saffron).toBeDefined();
    expect(toneMap.green).toBeDefined();
    expect(toneMap.navy).toBeDefined();
  });

  it('defines header nav links correctly', () => {
    expect(HEADER_NAV_LINKS).toHaveLength(4);
    expect(HEADER_NAV_LINKS[0]).toEqual({ label: 'Why Protest', href: '/why-students-are-protesting' });
  });

  it('defines site config and metadata', () => {
    expect(SITE_CONFIG.name).toBe('Indian Students Protest Vault');
    expect(SITE_METADATA.applicationName).toBe('Indian Students Protest Vault');
  });
});
