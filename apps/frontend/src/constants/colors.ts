/**
 * Available colour tones for UI components.
 *
 * @type {Tone}
 */
export type Tone = 'blue' | 'yellow' | 'red' | 'green' | 'black' | 'white';

/**
 * Maps each tone to its corresponding Tailwind background and text classes.
 */
export const toneMap: Record<Tone, string> = {
  blue: 'bg-blue-600 text-white',
  yellow: 'bg-yellow-400 text-black',
  red: 'bg-red-500 text-white',
  green: 'bg-green-600 text-white',
  black: 'bg-black text-white',
  white: 'bg-white text-black',
};
