/**
 * Union of all video category identifiers, including the 'all' catch-all.
 *
 * @type {VideoCategory}
 */
export type VideoCategory = 'all' | 'marches' | 'rallies' | 'candlelight' | 'art' | 'youth' | 'press';

/**
 * Metadata for a single video category.
 *
 * @type {CategoryEntry}
 * @property {VideoCategory} id - Category identifier.
 * @property {string} label - Display label for the category.
 * @property {string} color - Tone colour key for styling.
 * @property {string} description - Short description of the category.
 */
export interface CategoryEntry {
  id: VideoCategory;
  label: string;
  color: string;
  description: string;
}

/**
 * All available video categories with metadata.
 */
export const CATEGORIES: CategoryEntry[] = [
  {
    id: 'marches',
    label: 'Marches',
    color: 'yellow',
    description: 'People on the move — long walks for a long cause.',
  },
  {
    id: 'rallies',
    label: 'Rallies',
    color: 'black',
    description: 'Voices gathered in public squares and open grounds.',
  },
  {
    id: 'candlelight',
    label: 'Candlelight',
    color: 'blue',
    description: 'Quiet vigils, lit by small flames and steady conviction.',
  },
  { id: 'art', label: 'Protest Art', color: 'red', description: 'Murals, posters, performances — dissent in colour.' },
  { id: 'youth', label: 'Youth', color: 'green', description: 'Students and young voices shaping the conversation.' },
  {
    id: 'press',
    label: 'Press',
    color: 'white',
    description: 'Clips from journalists and independent reporters on the ground.',
  },
];

/**
 * Canonical display order for categories, excluding 'all'.
 */
export const CATEGORY_ORDER: Exclude<VideoCategory, 'all'>[] = [
  'marches',
  'rallies',
  'candlelight',
  'art',
  'youth',
  'press',
];

/**
 * Per-category metadata including search titles, tag, and hashtag.
 */
export const CATEGORY_META: Record<
  Exclude<VideoCategory, 'all'>,
  { titles: string[]; tag: string; hashtag: string }
> = {
  marches: {
    titles: ['March', 'Walk', 'Procession', 'Foot March', 'Solidarity Walk'],
    tag: 'march',
    hashtag: '#MarchForJustice',
  },
  rallies: {
    titles: ['Rally', 'Gathering', 'Assembly', 'Public Meet', 'Convention'],
    tag: 'rally',
    hashtag: '#PeoplesRally',
  },
  candlelight: {
    titles: ['Candlelight Vigil', 'Lantern Float', 'Diya Ceremony', 'Night Vigil', 'Candle March'],
    tag: 'vigil',
    hashtag: '#CandlelightVigil',
  },
  art: {
    titles: ['Mural', 'Street Art', 'Poster Walk', 'Performance', 'Graffiti'],
    tag: 'art',
    hashtag: '#ProtestArt',
  },
  youth: {
    titles: ['Students Rally', 'Campus Meet', 'Youth March', 'Student Walkout', 'College Sit-in'],
    tag: 'youth',
    hashtag: '#YouthForChange',
  },
  press: {
    titles: ['Press Briefing', 'Media Meet', 'Interview', 'Reportage', 'Ground Report'],
    tag: 'press',
    hashtag: '#PressFreedom',
  },
};
