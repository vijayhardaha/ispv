/**
 * Available colour tones for UI components.
 *
 * @type {Tone}
 */
export type Tone = 'default' | 'saffron' | 'green' | 'navy' | 'sun' | 'pink' | 'lime';

/**
 * Maps each tone to its corresponding Tailwind background and text classes.
 */
export const toneMap: Record<Tone, string> = {
  default: 'bg-white',
  saffron: 'bg-yellow-400 text-white',
  green: 'bg-blue-600 text-white',
  navy: 'bg-black text-white',
  sun: 'bg-yellow-400 text-black',
  pink: 'bg-yellow-400 text-white',
  lime: 'bg-yellow-400 text-black',
};
