import type { Metadata } from 'next';

import { SITE_METADATA, SITE_CONFIG } from '@/constants/seo';
import { siteUrl, getPermaLink } from '@/lib/seo';

/**
 * Props for generating metadata, including title, description, and path for SEO.
 *
 * @type {SeoProps}
 * @property {string} title - Page title
 * @property {string} description - Page description
 * @property {string} [path] - URL slug to generate the canonical URL
 * @property {boolean} [postfix] - Whether to append the site name postfix
 */
export interface SeoProps {
  title: string;
  description: string;
  path?: string;
  postfix?: boolean;
}

/**
 * A generic object type with string keys and any values.
 *
 * @type {AnyObject}
 */
type AnyObject = Record<string, any>;

/**
 * Determine whether a value is a plain object (not null and not an array).
 *
 * @param {unknown} value - Value to test.
 *
 * @returns {value is AnyObject} True when the value is a plain object.
 */
const isPlainObject = (value: unknown): value is AnyObject => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

/**
 * Deeply merge two plain objects producing a new object.
 *
 * Behavior:
 * - Arrays from the source replace arrays on the target.
 * - Plain nested objects are merged recursively.
 * - Primitive values from the source override the target.
 *
 * @template T - The target object type.
 *
 * @param {T} target - The target object to merge into.
 * @param {AnyObject} source - The source object with values to merge.
 *
 * @returns {T} A new object resulting from merging source into target.
 *
 * @example
 * const base = { a: 1, nested: { x: 1 }, list: [1,2] };
 * const override = { b: 2, nested: { y: 2 }, list: [3] };
 * const merged = mergeDeep(base, override);
 * // merged -> { a:1, b:2, nested: { x:1, y:2 }, list: [3] }
 */
const mergeDeep = <T extends AnyObject>(target: T, source: AnyObject): T => {
  const output = { ...target } as AnyObject;
  if (isPlainObject(target) && isPlainObject(source)) {
    Object.keys(source).forEach((key) => {
      const targetValue = target[key];
      const sourceValue = source[key];
      if (Array.isArray(sourceValue)) {
        output[key] = sourceValue;
      } else if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
        output[key] = mergeDeep(targetValue, sourceValue);
      } else {
        output[key] = sourceValue;
      }
    });
  }
  return output as T;
};

/**
 * Build a consistent SEO title by appending the configured postfix.
 *
 * @param {string} title - The page-specific title.
 * @param {boolean} postfix - Whether to append the site name postfix.
 *
 * @returns {string} The resulting SEO title, or the site default when title is empty.
 *
 * @example
 * buildSeoTitle('About') // -> 'About | Indian Students Protest Vault'
 */
const buildSeoTitle = (title: string = '', postfix: boolean): string => {
  if (!title) {
    return SITE_CONFIG.name;
  }
  if (!postfix) {
    return title;
  }
  return [title, '|', SITE_CONFIG.name].join(' ');
};

/**
 * Generate a complete metadata object for SEO, Open Graph, and Twitter cards.
 *
 * @param {SeoProps} params - The parameters object containing optional title, description and slug.
 * @param {string} [params.title] - Page title to include in SEO metadata.
 * @param {string} [params.description] - Page description for SEO and social cards.
 * @param {string} [params.path] - URL slug to generate the canonical URL.
 *
 * @returns {Record<string, unknown>} A metadata object suitable for Next.js metadata and social sharing.
 *
 * @example
 * const meta = buildMetadata({ title: 'Videos', description: 'Browse the archive', path: 'videos' });
 */
export const buildMetadata = ({ title = '', description = '', path = '', postfix = false }: SeoProps): Metadata => {
  const canonical = getPermaLink(path);
  const titleAndDescription = {
    title: buildSeoTitle(title, postfix),
    description: description || SITE_CONFIG.description,
  };

  const newMetadata = mergeDeep(SITE_METADATA, {
    ...titleAndDescription,
    metadataBase: new URL(siteUrl()),
    alternates: { canonical },
    openGraph: { ...titleAndDescription, url: canonical },
    twitter: { ...titleAndDescription },
  });

  return newMetadata;
};
