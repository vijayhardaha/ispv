/**
 * Trims surrounding whitespace and title-cases each word of a city name.
 *
 * @param {string} city - Raw city input value.
 *
 * @returns {string} Trimmed city name with capitalized words (e.g. "New Delhi").
 */
export const capitalizeCity = (city: string): string =>
  city
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word))
    .join(' ');
