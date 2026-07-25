import { describe, expect, it } from 'vitest';

import { buildBreadcrumbs, globalSchema } from '../schema';

describe('schema utils', () => {
  describe('buildBreadcrumbs', () => {
    it('returns Home and current page breadcrumbs', () => {
      const crumbs = buildBreadcrumbs('/about', 'About Us');
      expect(crumbs).toEqual([
        { name: 'Home', path: '' },
        { name: 'About Us', path: '/about' },
      ]);
    });
  });

  describe('globalSchema', () => {
    it('returns an array of 3 schema objects (Person, Organization, WebSite)', () => {
      const schemas = globalSchema();
      expect(schemas).toHaveLength(3);
      expect(schemas[0]).toBeDefined();
      expect(schemas[1]).toBeDefined();
      expect(schemas[2]).toBeDefined();
    });
  });
});
