/** Maximum number of tags allowed. */
export const MAX_TAGS = 15;

/** Maximum number of words allowed across all tags combined. */
export const MAX_WORDS = 50;

/**
 * Parse a comma-separated tag string into a unique list of trimmed tags.
 *
 * @param {string} input - Raw tag input (comma or newline separated).
 *
 * @returns {string[]} Deduplicated array of trimmed tag strings.
 */
export function parseTags(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(/[,]+/)
        .map((t) => t.trim())
        .filter(Boolean)
    )
  );
}

/**
 * Counts the total number of words across all tags.
 *
 * @param {string[]} tags - Array of tag strings.
 *
 * @returns {number} Total word count.
 */
export function countWords(tags: string[]): number {
  return tags.reduce((sum, tag) => sum + tag.split(/\s+/).filter(Boolean).length, 0);
}
