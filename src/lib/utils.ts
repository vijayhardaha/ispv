import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names using clsx and tailwind-merge.
 *
 * @param {...ClassValue} inputs - Class values to merge.
 *
 * @returns {string} Merged class string.
 */
export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};

/**
 * Formats a number into a human-readable string with K/M suffixes.
 *
 * @param {number} n - The number to format.
 *
 * @returns {string} Formatted number string (e.g. "1.2K", "3M").
 */
export const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
};

/**
 * Returns a human-readable relative time string from an ISO date.
 *
 * @param {string} iso - ISO 8601 date string.
 *
 * @returns {string} Relative time (e.g. "3h ago", "2d ago").
 */
export const timeAgo = (iso: string): string => {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
};

/**
 * Extracts the media ID from an Instagram post or reel URL.
 *
 * @param {string} url - Instagram URL.
 *
 * @returns {string | null} The media ID, or null if the URL is invalid.
 */
export const extractInstagramId = (url: string): string | null => {
  const m = url.match(/instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
};

/**
 * Builds an Instagram embed URL from a post or reel URL.
 *
 * @param {string} url - Instagram post or reel URL.
 *
 * @returns {string | null} Embed URL with UTM source, or null if invalid.
 */
export const instagramEmbedUrl = (url: string): string | null => {
  const id = extractInstagramId(url);
  if (!id) return null;
  const isReel = /\/reel(s)?\//.test(url);
  const path = isReel ? `reel/${id}` : `p/${id}`;
  return `https://www.instagram.com/${path}/?utm_source=ig_embed`;
};
