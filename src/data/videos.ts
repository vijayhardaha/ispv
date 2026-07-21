export type VideoCategory = 'all' | 'marches' | 'rallies' | 'candlelight' | 'art' | 'youth' | 'press';

/**
 * A single video entry in the protest archive.
 *
 * @type {VideoEntry}
 * @property {string} id - Unique identifier for the video.
 * @property {string} title - Short title of the video.
 * @property {string} description - Longer description or caption.
 * @property {string} url - Original Instagram URL.
 * @property {string} thumbnail - Thumbnail image URL.
 * @property {string} city - City where the video was recorded.
 * @property {string} state - State or union territory.
 * @property {Exclude<VideoCategory, 'all'>} category - Protest category.
 * @property {string[]} tags - Searchable tags for filtering.
 * @property {string[]} hashtags - Hashtags associated with the video.
 * @property {string} submittedBy - Handle of the person who submitted it.
 * @property {string} submittedAt - ISO 8601 submission timestamp.
 * @property {number} views - View count.
 * @property {number} likes - Like count.
 * @property {number} duration - Duration in seconds.
 * @property {boolean} [featured] - Whether the video is featured on the homepage.
 */
export interface VideoEntry {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  city: string;
  state: string;
  category: Exclude<VideoCategory, 'all'>;
  tags: string[];
  hashtags: string[];
  submittedBy: string;
  submittedAt: string; // ISO
  views: number;
  likes: number;
  duration: number; // seconds
  featured?: boolean;
}

export const CATEGORIES: { id: VideoCategory; label: string; color: string; description: string }[] = [
  {
    id: 'marches',
    label: 'Marches',
    color: 'saffron',
    description: 'People on the move \u2014 long walks for a long cause.',
  },
  {
    id: 'rallies',
    label: 'Rallies',
    color: 'navy',
    description: 'Voices gathered in public squares and open grounds.',
  },
  {
    id: 'candlelight',
    label: 'Candlelight',
    color: 'sun',
    description: 'Quiet vigils, lit by small flames and steady conviction.',
  },
  {
    id: 'art',
    label: 'Protest Art',
    color: 'hotpink',
    description: 'Murals, posters, performances \u2014 dissent in colour.',
  },
  { id: 'youth', label: 'Youth', color: 'lime', description: 'Students and young voices shaping the conversation.' },
  {
    id: 'press',
    label: 'Press',
    color: 'indiaGreen',
    description: 'Clips from journalists and independent reporters on the ground.',
  },
];

/* Cities used to cycle through when building entries. */
const CITIES: { city: string; state: string; tag: string; hashtag: string }[] = [
  { city: 'Delhi', state: 'Delhi', tag: 'delhi', hashtag: '#Delhi' },
  { city: 'Mumbai', state: 'Maharashtra', tag: 'mumbai', hashtag: '#Mumbai' },
  { city: 'Bengaluru', state: 'Karnataka', tag: 'bengaluru', hashtag: '#Bengaluru' },
  { city: 'Kolkata', state: 'West Bengal', tag: 'kolkata', hashtag: '#Kolkata' },
  { city: 'Chennai', state: 'Tamil Nadu', tag: 'chennai', hashtag: '#Chennai' },
  { city: 'Hyderabad', state: 'Telangana', tag: 'hyderabad', hashtag: '#Hyderabad' },
  { city: 'Pune', state: 'Maharashtra', tag: 'pune', hashtag: '#Pune' },
  { city: 'Ahmedabad', state: 'Gujarat', tag: 'ahmedabad', hashtag: '#Ahmedabad' },
  { city: 'Jaipur', state: 'Rajasthan', tag: 'jaipur', hashtag: '#Jaipur' },
  { city: 'Lucknow', state: 'Uttar Pradesh', tag: 'lucknow', hashtag: '#Lucknow' },
  { city: 'Chandigarh', state: 'Punjab', tag: 'chandigarh', hashtag: '#Chandigarh' },
  { city: 'Srinagar', state: 'Jammu & Kashmir', tag: 'srinagar', hashtag: '#Srinagar' },
  { city: 'Guwahati', state: 'Assam', tag: 'guwahati', hashtag: '#Guwahati' },
  { city: 'Bhopal', state: 'Madhya Pradesh', tag: 'bhopal', hashtag: '#Bhopal' },
  { city: 'Patna', state: 'Bihar', tag: 'patna', hashtag: '#Patna' },
  { city: 'Indore', state: 'Madhya Pradesh', tag: 'indore', hashtag: '#Indore' },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', tag: 'vizag', hashtag: '#Vizag' },
  { city: 'Thiruvananthapuram', state: 'Kerala', tag: 'thiruvananthapuram', hashtag: '#Thiruvananthapuram' },
  { city: 'Bhubaneswar', state: 'Odisha', tag: 'bhubaneswar', hashtag: '#Bhubaneswar' },
  { city: 'Dehradun', state: 'Uttarakhand', tag: 'dehradun', hashtag: '#Dehradun' },
  { city: 'Ranchi', state: 'Jharkhand', tag: 'ranchi', hashtag: '#Ranchi' },
  { city: 'Nagpur', state: 'Maharashtra', tag: 'nagpur', hashtag: '#Nagpur' },
  { city: 'Varanasi', state: 'Uttar Pradesh', tag: 'varanasi', hashtag: '#Varanasi' },
  { city: 'Kochi', state: 'Kerala', tag: 'kochi', hashtag: '#Kochi' },
  { city: 'Coimbatore', state: 'Tamil Nadu', tag: 'coimbatore', hashtag: '#Coimbatore' },
  { city: 'Surat', state: 'Gujarat', tag: 'surat', hashtag: '#Surat' },
  { city: 'Jodhpur', state: 'Rajasthan', tag: 'jodhpur', hashtag: '#Jodhpur' },
];

/* Category-specific title prefixes. */
const CATEGORY_META: Record<Exclude<VideoCategory, 'all'>, { titles: string[]; tag: string; hashtag: string }> = {
  marches:    { titles: ['March', 'Walk', 'Procession', 'Foot March', 'Solidarity Walk'], tag: 'march',       hashtag: '#MarchForJustice' },
  rallies:    { titles: ['Rally', 'Gathering', 'Assembly', 'Public Meet', 'Convention'],  tag: 'rally',       hashtag: '#PeoplesRally' },
  candlelight:{ titles: ['Candlelight Vigil', 'Lantern Float', 'Diya Ceremony', 'Night Vigil', 'Candle March'], tag: 'vigil', hashtag: '#CandlelightVigil' },
  art:        { titles: ['Mural', 'Street Art', 'Poster Walk', 'Performance', 'Graffiti'], tag: 'art',        hashtag: '#ProtestArt' },
  youth:      { titles: ['Students Rally', 'Campus Meet', 'Youth March', 'Student Walkout', 'College Sit-in'], tag: 'youth', hashtag: '#YouthForChange' },
  press:      { titles: ['Press Briefing', 'Media Meet', 'Interview', 'Reportage', 'Ground Report'], tag: 'press', hashtag: '#PressFreedom' },
};

const SUBMITTERS = [
  '@ground.reporter', '@northline.media', '@south.witness', '@eastline.daily',
  '@desh.ki.awaz', '@campus.voices', '@nadi.ki.baat', '@jhelum.eye',
  '@ganga.ki.reporter', '@coast.citizen', '@pinkcity.collective', '@gpo.diary',
  '@brush.collective', '@north.east.daily', '@central.rep', '@kerala.shoreline',
  '@odisha.diary', '@malwa.youth', '@kalinga.line', '@ganga.source',
];

const THUMBNAILS = [
  'https://images.unsplash.com/photo-1591189824344-9b1e3d77bf13?w=720&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=720&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=720&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=720&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=720&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=720&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=720&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=720&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=720&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=720&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566837497312-7be4a47a1d70?w=720&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=720&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=720&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=720&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?w=720&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=720&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=720&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=720&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1495314734156-2e01796e6b6e?w=720&q=70&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=720&q=70&auto=format&fit=crop',
];

const DESCRIPTIONS = [
  'Citizens gather in a peaceful show of solidarity, voices united for a common cause.',
  'A quiet yet powerful demonstration fills the streets as people stand together.',
  'Hundreds assemble with placards and banners, chanting for justice and change.',
  'The energy is palpable as the crowd moves in unison, demanding accountability.',
  'A moving display of democratic participation, captured in a single frame.',
  'From young students to elderly citizens \u2014 the people show up, peacefully.',
  'Bystanders join in as the march passes through the heart of the city.',
  'A brief moment of silence followed by a collective roar for dignity and rights.',
  'The streets become a canvas for democratic expression, one step at a time.',
  'Women lead the way in this peaceful procession under the watch of the city.',
];

/* ── Build video entries from the real reel URLs ──────────────────── */
const REEL_IDS = [
  'Da8EAarT-k2', 'Da9lAORIKCh', 'Da9gt0XEeuO', 'Da8ZUPayqY3',
  'Da43_-jhkzd', 'Da9yQoLjlSN', 'Da7ZuDeoNXX', 'Da8hCRUvMP-',
  'Da2jcgAtoTr', 'Da7fg6XTM6L', 'DaLOKU5M8V_', 'Da5wFeuSfNr',
  'Da-iGB6zu0L', 'Da-azbisSuX', 'Da-RwE2Rkqu', 'DZz9ViPyPY_',
  'Da7_AKoT29U', 'Dawa-CyNiBa', 'Da-FHMOTf-R', 'Da0Xh7qOInE',
  'DaFqx23hmZo', 'Da6_9a5PrWr', 'DZ0h3xSjsdC', 'DZWgHAUsabB',
  'DazWxE-xxXR', 'DaRr1msjKCW', 'DaUU2BLokZp', 'Da-gVnORDiB',
  'DahQEJpsUAn', 'DalXh9Vv6xX', 'Da5gLnUSJhT', 'DYcOFfdkt2k',
  'Dak4-DZoCKU', 'DaxwIEBh28g', 'Da9n8cYMS1_', 'Da-zzS5tQUI',
  'Da9TkC3Tm89', 'Da_DaQrTShu', 'Da_mlQLSOxd', 'Da_QpLoMWU-',
  'Da7xfGks--s', 'Da-i_gzz0c4', 'Da_Ga1nz3uU', 'Da-bHHMsucc',
  'Da9ETsbztZC', 'Da7mj3zMRmI', 'Da9ZyKuot7K', 'DaGStUUJZ4E',
  'Da-VEI8N32w', 'Da-44pdvLuL', 'Da-H_3oBzef', 'DaCZQxfNB74',
  'Da-0_rBPvEg', 'Da-g2LSoNmg', 'Da-rZDAzVss', 'Da-gXqTo7BM',
  'Da-gRw2sm6D', 'Da9ZIP8pDi7', 'Da-xp9Uz199', 'Da-hBJyorPW',
  'Da-pEbwvgsj', 'Da7ucxKJVn5', 'DZ31ITgDAid', 'Da7dZOURsiB',
  'Da_c6TGz50w', 'Da-nL0hpaxa', 'Da9ydSJNVMv', 'Da-CIIMPBAi',
  'DZzs047Mqt_', 'Da-aa9Zy2LG', 'Daa4HQzSPd3', 'Da9v1PpTgJt',
  'DaF34w_vE4b', 'DZ4SbaQyPOh', 'Da-ysoJT-Hl', 'Da-XYteo5zz',
];

const CATEGORY_ORDER: Exclude<VideoCategory, 'all'>[] = ['marches', 'rallies', 'candlelight', 'art', 'youth', 'press'];

function buildVideos(): VideoEntry[] {
  let catIdx = 0;
  let thumbIdx = 0;
  let descIdx = 0;
  let submitterIdx = 0;

  return REEL_IDS.map((id, i) => {
    const cityMeta = CITIES[i % CITIES.length];
    const cat = CATEGORY_ORDER[catIdx % CATEGORY_ORDER.length];
    catIdx++;
    thumbIdx = (thumbIdx + 1) % THUMBNAILS.length;
    descIdx = (descIdx + 1) % DESCRIPTIONS.length;
    submitterIdx = (submitterIdx + 1) % SUBMITTERS.length;

    const daysAgo = (i % 60) + 1;
    const date = new Date('2025-06-15T12:00:00Z');
    date.setDate(date.getDate() - daysAgo);
    date.setHours(6 + (i % 14), (i * 7) % 60);

    const meta = CATEGORY_META[cat];
    const prefix = meta.titles[i % meta.titles.length];
    const featured = i < 6 ? true : undefined;

    return {
      id: `reel-${id}`,
      title: `${cityMeta.city} ${prefix} \u2014 #${id.slice(0, 6)}`,
      description: DESCRIPTIONS[descIdx],
      url: `https://www.instagram.com/reel/${id}/`,
      thumbnail: THUMBNAILS[thumbIdx],
      city: cityMeta.city,
      state: cityMeta.state,
      category: cat,
      tags: [cityMeta.tag, meta.tag, 'peaceful', 'protest'],
      hashtags: [cityMeta.hashtag, meta.hashtag, '#PeacefulProtest'],
      submittedBy: SUBMITTERS[submitterIdx],
      submittedAt: date.toISOString(),
      views: 10_000 + Math.floor(Math.random() * 200_000),
      likes: 1_000 + Math.floor(Math.random() * 25_000),
      duration: 20 + (i % 51),
      featured,
    };
  });
}

export const VIDEOS: VideoEntry[] = buildVideos();

export const ALL_TAGS = Array.from(new Set(VIDEOS.flatMap((v) => v.tags))).sort();

export const ALL_HASHTAGS = Array.from(new Set(VIDEOS.flatMap((v) => v.hashtags))).sort();

export type SortKey = 'newest' | 'oldest' | 'most-viewed' | 'most-liked' | 'title-az' | 'title-za';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'most-viewed', label: 'Most viewed' },
  { value: 'most-liked', label: 'Most liked' },
  { value: 'title-az', label: 'Title A\u2013Z' },
  { value: 'title-za', label: 'Title Z\u2013A' },
];

export const getVideoById = (id: string): VideoEntry | undefined =>
  VIDEOS.find((v) => v.id === id);

export const getCategoryById = (id: VideoCategory): (typeof CATEGORIES)[number] | undefined =>
  CATEGORIES.find((c) => c.id === id);
