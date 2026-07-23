/**
 * Category record shape matching the (now hardcoded) category metadata.
 *
 * @type {DbCategory}
 * @property {string} id - Unique identifier for the category.
 * @property {string} value - URL-friendly slug value.
 * @property {string} name - Display name for the category.
 * @property {string} color - Colour identifier for styling.
 * @property {string | null} description - Short description of the category.
 */
export interface DbCategory {
  id: string;
  value: string;
  name: string;
  color: string;
  description: string | null;
}

/**
 * Location record shape matching the (now hardcoded) location metadata.
 *
 * @type {DbLocation}
 * @property {string} id - Unique identifier for the location.
 * @property {string} value - URL-friendly slug value.
 * @property {string} name - Display name for the location.
 * @property {string | null} description - Short description of the location.
 */
export interface DbLocation {
  id: string;
  value: string;
  name: string;
  description: string | null;
}

/**
 * Hardcoded categories used across the frontend for filtering and display.
 * Order here determines display order.
 */
export const CATEGORIES: DbCategory[] = [
  {
    id: '1',
    value: 'protest-marches',
    name: 'Protest Marches',
    color: 'yellow',
    description: 'Peaceful protest marches and rallies',
  },
  {
    id: '2',
    value: 'police-conduct',
    name: 'Police Conduct',
    color: 'red',
    description: 'Police actions during protests',
  },
  {
    id: '3',
    value: 'night-updates',
    name: 'Night Updates',
    color: 'black',
    description: 'Night-time protest updates and reports',
  },
  {
    id: '4',
    value: 'important-protest-updates-announcements',
    name: 'Important Protest Updates & Announcements',
    color: 'white',
    description:
      'Stay informed with important updates for protesters, including event schedules, route changes, official announcements, safety advisories, meeting points, and campaign information.',
  },
  {
    id: '5',
    value: 'gen-z-movement',
    name: 'Gen Z Movement',
    color: 'green',
    description: 'Student-led youth movements',
  },
  {
    id: '6',
    value: 'official-statements',
    name: 'Official Statements',
    color: 'blue',
    description: 'Official statements from authorities and organisations',
  },
  {
    id: '7',
    value: 'counter-protests-public-reactions',
    name: 'Counter Protests & Public Reactions',
    color: 'yellow',
    description: 'Counter-protests and public reactions',
  },
  {
    id: '8',
    value: 'human-rights',
    name: 'Human Rights',
    color: 'red',
    description: 'Human rights advocacy and awareness',
  },
  {
    id: '9',
    value: 'news-coverage',
    name: 'News Coverage',
    color: 'black',
    description: 'News media coverage of the protests',
  },
  {
    id: '10',
    value: 'protest-vlogs',
    name: 'Protest Vlogs',
    color: 'white',
    description: 'First-person vlogs from the ground',
  },
  {
    id: '11',
    value: 'public-figures-creators',
    name: 'Public Figures & Creators',
    color: 'green',
    description: 'Public figures and content creators covering the protests',
  },
  {
    id: '12',
    value: 'acts-of-kindness',
    name: 'Acts of Kindness',
    color: 'blue',
    description: 'Moments of compassion and solidarity',
  },
  {
    id: '13',
    value: 'women-leading-movement',
    name: 'Women Leading the Movement',
    color: 'yellow',
    description: 'Women at the forefront of protests',
  },
  {
    id: '14',
    value: 'solidarity-protection',
    name: 'Solidarity & Protection',
    color: 'red',
    description: 'Acts of solidarity and protection during protests',
  },
  {
    id: '15',
    value: 'senior-citizens-voices',
    name: "Senior Citizens' Voices",
    color: 'black',
    description: 'Senior citizens participating and sharing their views',
  },
  {
    id: '16',
    value: 'children-voices',
    name: "Children's Voices",
    color: 'white',
    description: 'Children expressing their thoughts and participating',
  },
  {
    id: '17',
    value: 'celebrations-cultural-events',
    name: 'Celebrations & Cultural Events',
    color: 'green',
    description: 'Cultural events and celebrations during protests',
  },
  {
    id: '18',
    value: 'media-analysis',
    name: 'Media Analysis',
    color: 'blue',
    description: 'Analysis of media coverage and narratives',
  },
  {
    id: '19',
    value: 'fact-checks-and-misinformation',
    name: 'Fact Checks & Misinformation',
    color: 'yellow',
    description:
      'Explore fact checks, misinformation investigations, and verified explanations addressing viral claims, misleading posts, edited videos, and false narratives related to student protests.',
  },
  { id: '20', value: 'other', name: 'Other', color: 'red', description: 'Uncategorised protest content' },
];

/**
 * Hardcoded locations used across the frontend for filtering and display.
 * Order here determines display order.
 */
export const LOCATIONS: DbLocation[] = [
  { id: '1', value: 'delhi', name: 'Delhi', description: null },
  { id: '2', value: 'bihar', name: 'Bihar', description: null },
  { id: '3', value: 'madhya-pradesh', name: 'Madhya Pradesh', description: null },
  { id: '4', value: 'maharashtra', name: 'Maharashtra', description: null },
  { id: '5', value: 'punjab', name: 'Punjab', description: null },
  { id: '6', value: 'goa', name: 'Goa', description: null },
  { id: '7', value: 'arunachal-pradesh', name: 'Arunachal Pradesh', description: null },
  { id: '8', value: 'andhra-pradesh', name: 'Andhra Pradesh', description: null },
  { id: '9', value: 'assam', name: 'Assam', description: null },
  { id: '10', value: 'chhattisgarh', name: 'Chhattisgarh', description: null },
  { id: '11', value: 'gujarat', name: 'Gujarat', description: null },
  { id: '12', value: 'haryana', name: 'Haryana', description: null },
  { id: '13', value: 'himachal-pradesh', name: 'Himachal Pradesh', description: null },
  { id: '14', value: 'jharkhand', name: 'Jharkhand', description: null },
  { id: '15', value: 'karnataka', name: 'Karnataka', description: null },
  { id: '16', value: 'kerala', name: 'Kerala', description: null },
  { id: '17', value: 'manipur', name: 'Manipur', description: null },
  { id: '18', value: 'meghalaya', name: 'Meghalaya', description: null },
  { id: '19', value: 'mizoram', name: 'Mizoram', description: null },
  { id: '20', value: 'nagaland', name: 'Nagaland', description: null },
  { id: '21', value: 'odisha', name: 'Odisha', description: null },
  { id: '22', value: 'rajasthan', name: 'Rajasthan', description: null },
  { id: '23', value: 'sikkim', name: 'Sikkim', description: null },
  { id: '24', value: 'tamil-nadu', name: 'Tamil Nadu', description: null },
  { id: '25', value: 'telangana', name: 'Telangana', description: null },
  { id: '26', value: 'tripura', name: 'Tripura', description: null },
  { id: '27', value: 'uttar-pradesh', name: 'Uttar Pradesh', description: null },
  { id: '28', value: 'uttarakhand', name: 'Uttarakhand', description: null },
  { id: '29', value: 'west-bengal', name: 'West Bengal', description: null },
  { id: '30', value: 'chandigarh', name: 'Chandigarh', description: null },
  { id: '31', value: 'andaman-nicobar-islands', name: 'Andaman and Nicobar Islands', description: null },
  {
    id: '32',
    value: 'dadra-nagar-haveli-daman-diu',
    name: 'Dadra and Nagar Haveli and Daman and Diu',
    description: null,
  },
  { id: '33', value: 'jammu-kashmir', name: 'Jammu and Kashmir', description: null },
  { id: '34', value: 'ladakh', name: 'Ladakh', description: null },
  { id: '35', value: 'lakshadweep', name: 'Lakshadweep', description: null },
  { id: '36', value: 'puducherry', name: 'Puducherry', description: null },
  { id: '37', value: 'foreign', name: 'Foreign (Outside India)', description: null },
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
