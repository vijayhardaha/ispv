/**
 * Category record shape.
 */
export interface DbCategory {
  id: string;
  value: string;
  name: string;
  color: string;
  description: string | null;
}

export const CATEGORIES: DbCategory[] = [
  {
    id: '1',
    value: 'protest-marches',
    name: 'Protest Marches',
    color: 'yellow',
    description:
      'Explore publicly shared videos of protest marches across India, featuring peaceful rallies, processions, public gatherings, patriotic songs, and community participation.',
  },
  {
    id: '2',
    value: 'police-conduct',
    name: 'Police Conduct',
    color: 'red',
    description:
      'Browse videos documenting police presence, crowd management, barricading, detentions, and alleged use of force during student protests across India.',
  },
  {
    id: '3',
    value: 'night-updates',
    name: 'Night Updates',
    color: 'black',
    description:
      'Watch videos recorded during evening and overnight protests, including candlelight vigils, volunteer efforts, speeches, and updates from protest sites.',
  },
  {
    id: '4',
    value: 'gen-z-movement',
    name: 'Gen Z Movement',
    color: 'green',
    description:
      'Discover videos highlighting the leadership, creativity, participation, and voices of Gen Z students during peaceful protests and public movements.',
  },
  {
    id: '5',
    value: 'official-statements',
    name: 'Official Statements',
    color: 'blue',
    description:
      'Explore official announcements, press briefings, speeches, campaign updates, and public statements shared by protest organizers and representatives.',
  },
  {
    id: '6',
    value: 'public-figures-creators',
    name: 'Public Figures & Creators',
    color: 'green',
    description:
      'Watch videos shared by influencers, journalists, actors, educators, activists, and other public figures documenting or supporting student protests.',
  },
  {
    id: '7',
    value: 'news-coverage',
    name: 'News Coverage',
    color: 'black',
    description:
      'Browse television reports, digital news clips, interviews, debates, and media coverage documenting student protests and related developments.',
  },
  {
    id: '8',
    value: 'protest-vlogs',
    name: 'Protest Vlogs',
    color: 'white',
    description:
      'Explore personal vlog style videos documenting journeys, behind the scenes moments, daily experiences, and firsthand accounts from protest participants.',
  },
  {
    id: '9',
    value: 'acts-of-kindness',
    name: 'Acts of Kindness',
    color: 'blue',
    description:
      'Discover inspiring moments of compassion, solidarity, volunteer support, food distribution, medical assistance, and kindness shared during protests.',
  },
  {
    id: '10',
    value: 'women-leading-movement',
    name: 'Women Leading the Movement',
    color: 'yellow',
    description:
      'Explore videos highlighting women leading marches, organizing events, delivering speeches, coordinating volunteers, and inspiring peaceful public participation.',
  },
  {
    id: '11',
    value: 'solidarity-protection',
    name: 'Solidarity & Protection',
    color: 'red',
    description:
      'Watch videos showing protesters protecting one another, supporting vulnerable participants, forming human chains, and demonstrating unity during protests.',
  },
  {
    id: '12',
    value: 'senior-citizens-voices',
    name: "Senior Citizens' Voices",
    color: 'black',
    description:
      'Discover speeches, interviews, and heartfelt messages from senior citizens sharing support, advice, and perspectives on student movements across India.',
  },
  {
    id: '13',
    value: 'children-voices',
    name: "Children's Voices",
    color: 'white',
    description:
      'Browse publicly shared videos featuring children expressing messages of hope, participation, awareness, and support alongside peaceful public demonstrations.',
  },
  {
    id: '14',
    value: 'human-rights',
    name: 'Human Rights',
    color: 'red',
    description:
      'Explore videos documenting alleged human rights concerns, civil liberties issues, public accountability, and reported incidents during student protests.',
  },
  {
    id: '15',
    value: 'celebrations-cultural-events',
    name: 'Celebrations & Cultural Events',
    color: 'green',
    description:
      'Discover patriotic songs, cultural performances, celebrations, street art, poetry, music, and creative expressions shared during student protests.',
  },
  {
    id: '16',
    value: 'counter-protests-public-reactions',
    name: 'Counter Protests & Public Reactions',
    color: 'yellow',
    description:
      'Explore videos documenting counter demonstrations, differing viewpoints, public reactions, debates, and discussions surrounding student protests.',
  },
  {
    id: '17',
    value: 'media-analysis',
    name: 'Media Analysis',
    color: 'blue',
    description:
      'Browse videos discussing, comparing, or analyzing media coverage, reporting styles, public criticism, and journalism related to student protests.',
  },
  { id: '18', value: 'other', name: 'Other', color: 'gray', description: 'Uncategorised protest content' },
];

export const FEATURED_CATEGORIES_SLUGS = [
  'protest-marches',
  'police-conduct',
  'gen-z-movement',
  'night-updates',
  'human-rights',
  'women-leading-movement',
];
