/**
 * Formats a number into a human-readable string with K/M suffixes.
 *
 * @param {number} n - Number to format.
 *
 * @returns {string} Formatted number string (e.g. "1.2K", "3M").
 */
export const formatNumber = (n: number): string => {
  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }

  if (n >= 1_000) {
    return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }

  return String(n);
};

/**
 * Converts an ISO date string into a relative time description.
 *
 * @param {string} iso - ISO 8601 date string.
 *
 * @returns {string} Relative time string (e.g. "5m ago", "3d ago").
 */
export const timeAgo = (iso: string): string => {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) {
    return `${diff}s ago`;
  }
  if (diff < 3600) {
    return `${Math.floor(diff / 60)}m ago`;
  }
  if (diff < 86400) {
    return `${Math.floor(diff / 3600)}h ago`;
  }
  if (diff < 604800) {
    return `${Math.floor(diff / 86400)}d ago`;
  }
  return new Date(iso).toLocaleDateString();
};
