/**
 * Regex matching Instagram post, reel, or reels URLs.
 */
const IG_URL_RE = /(?:www\.)?instagram\.com\/(?:p|reel|reels)\/([a-zA-Z0-9_-]+)/;

/**
 * Extracts the media ID from an Instagram reel or post URL.
 *
 * @param {string} url - Instagram content URL.
 *
 * @returns {string | null} Extracted media ID, or null if no match.
 */
export const extractInstagramId = (url: string): string | null => {
  return url.match(IG_URL_RE)?.[1] ?? null;
};
