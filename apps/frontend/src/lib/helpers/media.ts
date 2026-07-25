/**
 * Returns a video thumbnail URL, falling back to a placeholder SVG when unavailable.
 *
 * @param {string | null | undefined} thumbnail - The raw thumbnail URL from the video entry.
 * @param {string} [fallback] - Optional fallback image path.
 *
 * @returns {string} The thumbnail URL or the fallback placeholder.
 */
export function getThumbnailSrc(thumbnail: string | null | undefined, fallback = '/sample.svg'): string {
  return thumbnail || fallback;
}
