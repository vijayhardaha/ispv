/**
 * Merges class names, filtering out falsy values.
 *
 * @param {...(string | undefined | null | false)} inputs - Class values to merge.
 *
 * @returns {string} Merged class string.
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}
