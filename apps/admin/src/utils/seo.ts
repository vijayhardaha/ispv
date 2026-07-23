/**
 * Return a normalized base URL for the running application.
 *
 * Preference order:
 * 1. `process.env.VERCEL_PROJECT_PRODUCTION_URL`
 * 2. `process.env.VERCEL_BRANCH_URL`
 * 3. `process.env.VERCEL_URL`
 * 4. `process.env.NEXT_PUBLIC_SITE_URL`
 * 5. Fallback to `http://localhost:{PORT}` where PORT defaults to 3001
 *
 * Normalization ensures a scheme is present and removes a trailing slash.
 *
 * @returns {string} The normalized base URL.
 */
export const siteUrl = (): string => {
  const candidates = [
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
  ];
  const url = candidates.find(Boolean) ?? `http://localhost:${process.env.PORT || 3001}`;
  const cleaned = url.trim().replace(/\/+$/, '');
  return /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
};
