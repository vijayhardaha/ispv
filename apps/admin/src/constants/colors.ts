/**
 * Map of variant names to Tailwind background/text color classes.
 * These are the only 6 valid colours across the admin panel.
 */
export const TAG_VARIANTS = {
  blue: 'bg-blue-600 text-white',
  yellow: 'bg-yellow-400 text-black',
  red: 'bg-red-500 text-white',
  green: 'bg-green-600 text-white',
  black: 'bg-black text-white',
  white: 'bg-white text-black',
} as const;

export type TagVariant = keyof typeof TAG_VARIANTS;

/** Canonical list of valid colour names. */
export const COLORS = Object.keys(TAG_VARIANTS) as unknown as TagVariant[];
