/**
 * A single video category used across the admin for filtering and display.
 *
 * @type {CategoryRecord}
 * @property {string} slug - URL-friendly slug derived from the category name.
 * @property {string} name - Human-readable category name.
 * @property {string} tag - Short display tag for the category.
 * @property {string} color - Color variant name matching TAG_VARIANTS.
 * @property {string | null} description - Detailed description of the category.
 */
export interface CategoryRecord {
  slug: string;
  name: string;
  tag: string;
  color: string;
  description: string | null;
}

/**
 * Hardcoded categories used across the admin for filtering and display.
 * Order here determines display order.
 */
export const CATEGORIES: CategoryRecord[] = [
  {
    slug: 'police-conduct',
    name: 'Police Conduct',
    tag: 'On the Frontline',
    color: 'amber',
    description:
      'Browse videos documenting police presence, crowd management, barricading, detentions, and alleged use of force during student protests across India.',
  },
  {
    slug: 'gen-z-moments',
    name: 'Gen Z Moments',
    tag: 'Generation Speaks',
    color: 'blue',
    description:
      'Discover videos highlighting the leadership, creativity, participation, and voices of Gen Z students during peaceful protests and public movements.',
  },
  {
    slug: 'protest-marches',
    name: 'Protest Marches',
    tag: 'Voices in Motion',
    color: 'cyan',
    description:
      'Explore publicly shared videos of protest marches across India, featuring peaceful rallies, processions, public gatherings, patriotic songs, and community participation.',
  },
  {
    slug: 'protest-vlogs',
    name: 'Protest Vlogs',
    tag: 'Through Their Lens',
    color: 'emerald',
    description:
      'Explore personal vlog style videos documenting journeys, behind the scenes moments, daily experiences, and firsthand accounts from protest participants.',
  },
  {
    slug: 'news-coverage',
    name: 'News Coverage',
    tag: 'In the Headlines',
    color: 'fuchsia',
    description:
      'Browse television reports, digital news clips, interviews, debates, and media coverage documenting student protests and related developments.',
  },
  {
    slug: 'public-figures-creators',
    name: 'Public Figures & Creators',
    tag: 'Public Voices',
    color: 'green',
    description:
      'Watch videos shared by influencers, journalists, actors, educators, activists, and other public figures documenting or supporting student protests.',
  },
  {
    slug: 'acts-of-kindness',
    name: 'Acts of Kindness',
    tag: 'Humanity First',
    color: 'indigo',
    description:
      'Discover inspiring moments of compassion, solidarity, volunteer support, food distribution, medical assistance, and kindness shared during protests.',
  },
  {
    slug: 'counter-protests-public-reactions',
    name: 'Counter Protests & Public Reactions',
    tag: 'Different Perspectives',
    color: 'lime',
    description:
      'Explore videos documenting counter demonstrations, differing viewpoints, public reactions, debates, and discussions surrounding student protests.',
  },
  {
    slug: 'official-statements',
    name: 'Official Statements',
    tag: 'From the Organizers',
    color: 'orange',
    description:
      'Explore official announcements, press briefings, speeches, campaign updates, and public statements shared by protest organizers and representatives.',
  },
  {
    slug: 'women-leading-movement',
    name: 'Women Leading the Movement',
    tag: 'Leading the Change',
    color: 'pink',
    description:
      'Explore videos highlighting women leading marches, organizing events, delivering speeches, coordinating volunteers, and inspiring peaceful public participation.',
  },
  {
    slug: 'human-rights',
    name: 'Human Rights',
    tag: 'Rights & Freedom',
    color: 'purple',
    description:
      'Explore videos documenting alleged human rights concerns, civil liberties issues, public accountability, and reported incidents during student protests.',
  },
  {
    slug: 'solidarity-protection',
    name: 'Solidarity & Protection',
    tag: 'Standing Together',
    color: 'red',
    description:
      'Watch videos showing protesters protecting one another, supporting vulnerable participants, forming human chains, and demonstrating unity during protests.',
  },
  {
    slug: 'senior-citizens-voices',
    name: "Senior Citizens' Voices",
    tag: 'Wisdom Speaks',
    color: 'rose',
    description:
      'Discover speeches, interviews, and heartfelt messages from senior citizens sharing support, advice, and perspectives on student movements across India.',
  },
  {
    slug: 'children-voices',
    name: "Children's Voices",
    tag: 'Voices of Tomorrow',
    color: 'sky',
    description:
      'Browse publicly shared videos featuring children expressing messages of hope, participation, awareness, and support alongside peaceful public demonstrations.',
  },
  {
    slug: 'celebrations-cultural-events',
    name: 'Celebrations & Cultural Events',
    tag: 'Culture & Unity',
    color: 'teal',
    description:
      'Discover patriotic songs, cultural performances, celebrations, street art, poetry, music, and creative expressions shared during student protests.',
  },
  {
    slug: 'night-updates',
    name: 'Night Updates',
    tag: 'After Sunset',
    color: 'violet',
    description:
      'Explore videos from evening and overnight protests, including speeches, volunteer activities, and updates from protest locations.',
  },
  {
    slug: 'media-analysis',
    name: 'Media Analysis',
    tag: 'Media Under Review',
    color: 'yellow',
    description:
      'Browse videos discussing, comparing, or analyzing media coverage, reporting styles, public criticism, and journalism related to student protests.',
  },
  { slug: 'other', name: 'Other', tag: 'More Stories', color: 'slate', description: 'Uncategorised protest content.' },
];
