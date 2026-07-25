/**
 * Return a normalized base URL for the running application.
 *
 * Preference order:
 * 1. `process.env.VERCEL_PROJECT_PRODUCTION_URL`
 * 2. `process.env.VERCEL_BRANCH_URL`
 * 3. `process.env.VERCEL_URL`
 * 4. `process.env.NEXT_PUBLIC_SITE_URL`
 * 5. Fallback to `http://localhost:{PORT}` where PORT defaults to 3000
 *
 * Normalization ensures a scheme is present and removes a trailing slash.
 *
 * @returns {string} The normalized base URL.
 *
 * @example
 * // When no Vercel env vars are set and PORT is 3000
 * siteUrl() // -> 'http://localhost:3000'
 */
export const siteUrl = (): string => {
  const candidates = [
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ];
  const url = candidates.find(Boolean) ?? `http://localhost:${process.env.PORT || 3000}`;
  const cleaned = url.trim().replace(/\/+$/, '');
  return /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
};

/**
 * Normalizes a slug for canonical usage.
 *
 * - Removes leading and trailing slashes
 * - Returns empty string for root
 *
 * @param {string} [path] - The input path or slug.
 *
 * @returns {string} A clean relative path without leading slash.
 *
 * @example
 * cleanPath("about") // "about"
 * cleanPath("/about") // "about"
 * cleanPath("/about/") // "about"
 * cleanPath("") // ""
 * cleanPath("/") // ""
 */
const cleanPath = (path: string = ''): string => {
  return path.trim().replace(/^\/+/, '').replace(/\/+$/, '');
};

/**
 * Generates a fully qualified permalink.
 *
 * Combines the application's base URL with a normalized path.
 * Leading and trailing slashes in the path are handled safely.
 * If no path is provided, the base URL is returned.
 *
 * @param {string} [path] - Optional path segment to append to the base URL.
 *
 * @returns {string} The permalink absolute URL.
 *
 * @example
 * // Assuming siteUrl() returns "https://example.com"
 * getPermaLink("about") // → "https://example.com/about"
 * getPermaLink("/about") // → "https://example.com/about"
 * getPermaLink("/about/") // → "https://example.com/about"
 * getPermaLink("") // → "https://example.com"
 * getPermaLink("/") // → "https://example.com"
 */
export const getPermaLink = (path: string = ''): string => {
  return [siteUrl(), cleanPath(path)].filter(Boolean).join('/');
};
