/**
 * Map of variant names to Tailwind background/text color classes.
 * These are the only 18 valid colours across the admin panel, one per category.
 */
export const TAG_VARIANTS = {
  amber: 'bg-amber-500 text-black',
  blue: 'bg-blue-600 text-white',
  cyan: 'bg-cyan-700 text-white',
  emerald: 'bg-emerald-600 text-white',
  fuchsia: 'bg-fuchsia-600 text-white',
  green: 'bg-green-600 text-white',
  indigo: 'bg-indigo-600 text-white',
  lime: 'bg-lime-500 text-black',
  orange: 'bg-orange-500 text-black',
  pink: 'bg-pink-600 text-white',
  purple: 'bg-purple-600 text-white',
  red: 'bg-red-500 text-white',
  rose: 'bg-rose-600 text-white',
  sky: 'bg-sky-700 text-white',
  teal: 'bg-teal-600 text-white',
  violet: 'bg-violet-600 text-white',
  yellow: 'bg-yellow-400 text-black',
  slate: 'bg-slate-600 text-white',
} as const;

/** Valid colour variants derived from the TAG_VARIANTS keys. */
export type TagVariant = keyof typeof TAG_VARIANTS;

/** Canonical list of valid colour names. */
export const COLORS = Object.keys(TAG_VARIANTS) as unknown as TagVariant[];
