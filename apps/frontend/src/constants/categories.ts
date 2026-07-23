/**
 * Category record shape.
 */
export interface DbCategory {
  id: string;
  slug: string;
  name: string;
  tag: string;
  color: string;
  description: string | null;
}

/**
 * Hardcoded categories used across the frontend for filtering and display.
 * Order here determines display order.
 */
export const CATEGORIES: DbCategory[] = [
  {
    id: '1',
    slug: 'protest-marches',
    name: 'Protest Marches',
    tag: 'Voices in Motion',
    color: 'yellow',
    description:
      'Explore publicly shared videos of protest marches across India, featuring peaceful rallies, processions, public gatherings, patriotic songs, and community participation.',
  },
  {
    id: '2',
    slug: 'police-conduct',
    name: 'Police Conduct',
    tag: 'On the Frontline',
    color: 'red',
    description:
      'Browse videos documenting police presence, crowd management, barricading, detentions, and alleged use of force during student protests across India.',
  },
  {
    id: '3',
    slug: 'night-updates',
    name: 'Night Updates',
    tag: 'After Sunset',
    color: 'black',
    description:
      'Explore videos from evening and overnight protests, including speeches, volunteer activities, and updates from protest locations.',
  },
  {
    id: '4',
    slug: 'gen-z-moments',
    name: 'Gen Z Moments',
    tag: 'Generation Speaks',
    color: 'green',
    description:
      'Discover videos highlighting the leadership, creativity, participation, and voices of Gen Z students during peaceful protests and public movements.',
  },
  {
    id: '5',
    slug: 'official-statements',
    name: 'Official Statements',
    tag: 'From the Organizers',
    color: 'blue',
    description:
      'Explore official announcements, press briefings, speeches, campaign updates, and public statements shared by protest organizers and representatives.',
  },
  {
    id: '6',
    slug: 'public-figures-creators',
    name: 'Public Figures & Creators',
    tag: 'Public Voices',
    color: 'green',
    description:
      'Watch videos shared by influencers, journalists, actors, educators, activists, and other public figures documenting or supporting student protests.',
  },
  {
    id: '7',
    slug: 'news-coverage',
    name: 'News Coverage',
    tag: 'In the Headlines',
    color: 'black',
    description:
      'Browse television reports, digital news clips, interviews, debates, and media coverage documenting student protests and related developments.',
  },
  {
    id: '8',
    slug: 'protest-vlogs',
    name: 'Protest Vlogs',
    tag: 'Through Their Lens',
    color: 'white',
    description:
      'Explore personal vlog style videos documenting journeys, behind the scenes moments, daily experiences, and firsthand accounts from protest participants.',
  },
  {
    id: '9',
    slug: 'acts-of-kindness',
    name: 'Acts of Kindness',
    tag: 'Humanity First',
    color: 'blue',
    description:
      'Discover inspiring moments of compassion, solidarity, volunteer support, food distribution, medical assistance, and kindness shared during protests.',
  },
  {
    id: '10',
    slug: 'women-leading-movement',
    name: 'Women Leading the Movement',
    tag: 'Leading the Change',
    color: 'yellow',
    description:
      'Explore videos highlighting women leading marches, organizing events, delivering speeches, coordinating volunteers, and inspiring peaceful public participation.',
  },
  {
    id: '11',
    slug: 'solidarity-protection',
    name: 'Solidarity & Protection',
    tag: 'Standing Together',
    color: 'red',
    description:
      'Watch videos showing protesters protecting one another, supporting vulnerable participants, forming human chains, and demonstrating unity during protests.',
  },
  {
    id: '12',
    slug: 'senior-citizens-voices',
    name: "Senior Citizens' Voices",
    tag: 'Wisdom Speaks',
    color: 'black',
    description:
      'Discover speeches, interviews, and heartfelt messages from senior citizens sharing support, advice, and perspectives on student movements across India.',
  },
  {
    id: '13',
    slug: 'children-voices',
    name: "Children's Voices",
    tag: 'Voices of Tomorrow',
    color: 'white',
    description:
      'Browse publicly shared videos featuring children expressing messages of hope, participation, awareness, and support alongside peaceful public demonstrations.',
  },
  {
    id: '14',
    slug: 'human-rights',
    name: 'Human Rights',
    tag: 'Rights & Freedom',
    color: 'red',
    description:
      'Explore videos documenting alleged human rights concerns, civil liberties issues, public accountability, and reported incidents during student protests.',
  },
  {
    id: '15',
    slug: 'celebrations-cultural-events',
    name: 'Celebrations & Cultural Events',
    tag: 'Culture & Unity',
    color: 'green',
    description:
      'Discover patriotic songs, cultural performances, celebrations, street art, poetry, music, and creative expressions shared during student protests.',
  },
  {
    id: '16',
    slug: 'counter-protests-public-reactions',
    name: 'Counter Protests & Public Reactions',
    tag: 'Different Perspectives',
    color: 'yellow',
    description:
      'Explore videos documenting counter demonstrations, differing viewpoints, public reactions, debates, and discussions surrounding student protests.',
  },
  {
    id: '17',
    slug: 'media-analysis',
    name: 'Media Analysis',
    tag: 'Media Under Review',
    color: 'blue',
    description:
      'Browse videos discussing, comparing, or analyzing media coverage, reporting styles, public criticism, and journalism related to student protests.',
  },
  {
    id: '18',
    slug: 'other',
    name: 'Other',
    tag: 'More Stories',
    color: 'gray',
    description: 'Uncategorised protest content.',
  },
];

/**
 * Category slugs highlighted as featured on the homepage.
 */
export const FEATURED_CATEGORIES_SLUGS = [
  'protest-marches',
  'police-conduct',
  'gen-z-movement',
  'night-updates',
  'human-rights',
  'women-leading-movement',
];
