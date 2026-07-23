/**
 * Regex matching Instagram post, reel, or reels URLs.
 */
const IG_URL_RE = /(?:www\.)?instagram\.com\/(?:p|reel|reels)\/([a-zA-Z0-9_-]+)/;

/**
 * Extracts the Instagram media ID from a reel, post, or TV URL.
 *
 * @param {string} url - Instagram content URL.
 *
 * @returns {string | null} Extracted media ID, or null if no match.
 */
export function extractIgId(url: string): string | null {
  return url.match(IG_URL_RE)?.[1] ?? null;
}

/**
 * Detects the source platform from a video URL.
 *
 * @param {string} url - Video URL to inspect.
 *
 * @returns {string} Platform name ("youtube" or "instagram").
 */
export function detectSource(url: string): string {
  if (/youtube\.com|youtu\.be/i.test(url)) {
    return 'youtube';
  }
  if (/instagram\.com/i.test(url)) {
    return 'instagram';
  }
  return 'instagram';
}

/**
 * Builds the best available display URL for a video record.
 *
 * @param {object} v - Video record.
 * @param {string} v.video_src - Source platform.
 * @param {string|null} [v.video_id] - Extracted Instagram media ID.
 * @param {string} [v.video_url] - Original Instagram URL.
 *
 * @returns {string} Clickable URL for the video.
 */
export function displayVideoUrl(v: { video_src: string; video_id?: string | null; video_url?: string }): string {
  if (v.video_src === 'youtube') {
    return v.video_url ?? '';
  }
  if (v.video_id) {
    return `https://www.instagram.com/p/${v.video_id}/`;
  }
  return v.video_url ?? '';
}

/**
 * Reconstructs a full Instagram reels URL from a media ID.
 *
 * @param {string} id - Instagram media ID.
 *
 * @returns {string} Full Instagram URL.
 */
export function reconstructIgUrl(id: string): string {
  return `https://www.instagram.com/p/${id}/`;
}
