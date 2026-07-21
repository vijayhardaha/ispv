/**
 * Extracts the media ID from an Instagram reel, post, or TV URL.
 *
 * @param {string} url - Instagram content URL.
 *
 * @returns {string | null} Extracted media ID, or null if no match.
 */
export const extractInstagramId = (url: string): string | null => {
  const m = url.match(/instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
};
