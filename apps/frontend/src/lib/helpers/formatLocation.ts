import { LOCATIONS } from '@/constants/locations';

/**
 * Resolves a location slug to its display name and deduplicates against the
 * city value using case-insensitive comparison. Returns a single label for display.
 *
 * Examples:
 * - city: "Delhi", location: "delhi"         → "Delhi"  (deduplicated)
 * - city: "Indore", location: "madhya-pradesh" → "Indore, Madhya Pradesh"
 * - city: "", location: "delhi"               → "delhi"  (empty city)
 * - city: "Mumbai", location: ""              → "Mumbai" (empty location)
 *
 * @param {string} city - Video city name.
 * @param {string} location - Video location slug (e.g. "madhya-pradesh").
 *
 * @returns {string} A formatted location label, deduplicated where appropriate.
 */
export function formatLocationLabel(city: string, location: string): string {
  const matchedLoc = LOCATIONS.find((l) => l.slug === location);
  const locName = matchedLoc?.name ?? location ?? '';
  if (!city && !locName) {
    return '';
  }

  if (locName.toLowerCase() === city.toLowerCase()) {
    return city;
  }
  return [city, locName].filter(Boolean).join(', ');
}
