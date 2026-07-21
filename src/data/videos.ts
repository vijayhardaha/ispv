export type VideoCategory = "all" | "marches" | "rallies" | "candlelight" | "art" | "youth" | "press";

export interface VideoEntry {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  city: string;
  state: string;
  category: Exclude<VideoCategory, "all">;
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
    id: "marches",
    label: "Marches",
    color: "saffron",
    description: "People on the move — long walks for a long cause."
  },
  {
    id: "rallies",
    label: "Rallies",
    color: "navy",
    description: "Voices gathered in public squares and open grounds."
  },
  {
    id: "candlelight",
    label: "Candlelight",
    color: "sun",
    description: "Quiet vigils, lit by small flames and steady conviction."
  },
  {
    id: "art",
    label: "Protest Art",
    color: "hotpink",
    description: "Murals, posters, performances — dissent in colour."
  },
  { id: "youth", label: "Youth", color: "lime", description: "Students and young voices shaping the conversation." },
  {
    id: "press",
    label: "Press",
    color: "indiaGreen",
    description: "Clips from journalists and independent reporters on the ground."
  }
];

// Helpers to build mock entries that are visually rich but still represent
// the two real Instagram reels the user provided. We include the real URLs
// as the primary examples; the rest are mock entries that share the same
// domain so the UI has enough to demo filters, sort, and pagination.
const REAL_VIDEOS: VideoEntry[] = [
  {
    id: "reel-DbAsCvVv59H",
    title: "Delhi March — Voices in the Streets",
    description:
      "A wide-angle capture of a peaceful march through central Delhi. Chants rise, banners sway, and the city holds its breath for a moment of reckoning.",
    url: "https://www.instagram.com/reel/DbAsCvVv59H/?utm_source=ig_web_copy_link",
    thumbnail: "https://images.unsplash.com/photo-1591189824344-9b1e3d77bf13?w=720&q=70&auto=format&fit=crop",
    city: "Delhi",
    state: "Delhi",
    category: "marches",
    tags: ["peaceful", "march", "delhi", "people"],
    hashtags: ["#Aazaadi", "#DelhiMarch", "#PeacefulProtest"],
    submittedBy: "@ground.reporter",
    submittedAt: "2025-06-12T14:30:00Z",
    views: 184_231,
    likes: 21_402,
    duration: 47,
    featured: true
  },
  {
    id: "reel-DbA9mpjIyfX",
    title: "Chandigarh Square — Singing the National Song",
    description:
      "Crowds gather at a city square and break into the national song, flags held high. A rare moment of quiet togetherness in a noisy week.",
    url: "https://www.instagram.com/reel/DbA9mpjIyfX/?utm_source=ig_web_copy_link",
    thumbnail: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=720&q=70&auto=format&fit=crop",
    city: "Chandigarh",
    state: "Punjab",
    category: "rallies",
    tags: ["sing", "rally", "chandigarh", "national"],
    hashtags: ["#ChandigarhSquare", "#WeSing", "#PeacefulProtest"],
    submittedBy: "@northline.media",
    submittedAt: "2025-06-11T09:15:00Z",
    views: 96_540,
    likes: 12_088,
    duration: 33,
    featured: true
  }
];

const MOCK_VIDEOS: VideoEntry[] = [
  {
    id: "v-001",
    title: "Mumbai Coastal Walk at Dawn",
    description: "A long, silent walk along Marine Drive as the city wakes up.",
    url: "https://www.instagram.com/reel/example-mumbai-coastal",
    thumbnail: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=720&q=70&auto=format&fit=crop",
    city: "Mumbai",
    state: "Maharashtra",
    category: "marches",
    tags: ["mumbai", "dawn", "coastal", "peaceful"],
    hashtags: ["#Mumbai", "#DawnMarch", "#SilentWalk"],
    submittedBy: "@coast.citizen",
    submittedAt: "2025-06-10T05:42:00Z",
    views: 42_180,
    likes: 3_201,
    duration: 58
  },
  {
    id: "v-002",
    title: "Bengaluru Cubbon Park Candle Vigil",
    description: "Hundreds of candles arranged in concentric circles around the bandstand.",
    url: "https://www.instagram.com/reel/example-bengaluru-candles",
    thumbnail: "https://images.unsplash.com/photo-1540202404-a2f29016b523?w=720&q=70&auto=format&fit=crop",
    city: "Bengaluru",
    state: "Karnataka",
    category: "candlelight",
    tags: ["candles", "vigil", "bengaluru", "park"],
    hashtags: ["#CandleVigil", "#Bengaluru", "#WeRemember"],
    submittedBy: "@south.witness",
    submittedAt: "2025-06-09T19:18:00Z",
    views: 78_904,
    likes: 9_412,
    duration: 24
  },
  {
    id: "v-003",
    title: "Kolkata Metro Wall — A Mural in Progress",
    description: "Local artists painting a 40-foot mural on a metro underpass wall.",
    url: "https://www.instagram.com/reel/example-kolkata-mural",
    thumbnail: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=720&q=70&auto=format&fit=crop",
    city: "Kolkata",
    state: "West Bengal",
    category: "art",
    tags: ["art", "mural", "kolkata", "wall"],
    hashtags: ["#ProtestArt", "#KolkataMural", "#WallsSpeak"],
    submittedBy: "@brush.collective",
    submittedAt: "2025-06-08T13:25:00Z",
    views: 31_022,
    likes: 4_788,
    duration: 41
  },
  {
    id: "v-004",
    title: "Hyderabad Students Read the Preamble",
    description: "University students gather in a courtyard and read the Preamble aloud.",
    url: "https://www.instagram.com/reel/example-hyderabad-students",
    thumbnail: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=720&q=70&auto=format&fit=crop",
    city: "Hyderabad",
    state: "Telangana",
    category: "youth",
    tags: ["students", "preamble", "hyderabad", "read"],
    hashtags: ["#Youth", "#Preamble", "#ReadTogether"],
    submittedBy: "@campus.voices",
    submittedAt: "2025-06-07T10:05:00Z",
    views: 56_733,
    likes: 6_140,
    duration: 52
  },
  {
    id: "v-005",
    title: "Chennai Marina Beach Human Chain",
    description: "A 2 km human chain along the Marina, holding hands in silence.",
    url: "https://www.instagram.com/reel/example-chennai-chain",
    thumbnail: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=720&q=70&auto=format&fit=crop",
    city: "Chennai",
    state: "Tamil Nadu",
    category: "marches",
    tags: ["chain", "marina", "chennai", "peaceful"],
    hashtags: ["#HumanChain", "#Marina", "#HoldOn"],
    submittedBy: "@eastline.daily",
    submittedAt: "2025-06-06T17:00:00Z",
    views: 102_412,
    likes: 14_092,
    duration: 36
  },
  {
    id: "v-006",
    title: "Pune Press Briefing — Ground Report",
    description: "A local reporter gives a minute-long update from a protest site in Pune.",
    url: "https://www.instagram.com/reel/example-pune-press",
    thumbnail: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=720&q=70&auto=format&fit=crop",
    city: "Pune",
    state: "Maharashtra",
    category: "press",
    tags: ["press", "pune", "report", "news"],
    hashtags: ["#GroundReport", "#Pune", "#Press"],
    submittedBy: "@desh.ki.awaz",
    submittedAt: "2025-06-05T20:11:00Z",
    views: 24_330,
    likes: 2_018,
    duration: 64
  },
  {
    id: "v-007",
    title: "Jaipur Hawa Mahal Posters",
    description: "Volunteers paste posters under the Hawa Mahal — poetry and slogans.",
    url: "https://www.instagram.com/reel/example-jaipur-posters",
    thumbnail: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=720&q=70&auto=format&fit=crop",
    city: "Jaipur",
    state: "Rajasthan",
    category: "art",
    tags: ["jaipur", "posters", "hawamahal", "poetry"],
    hashtags: ["#HawaMahal", "#Posters", "#Poetry"],
    submittedBy: "@pinkcity.collective",
    submittedAt: "2025-06-04T15:45:00Z",
    views: 19_876,
    likes: 2_744,
    duration: 27
  },
  {
    id: "v-008",
    title: "Lucknow GPO Clock Tower Vigil",
    description: "A small group holds a quiet vigil with photographs and diyas.",
    url: "https://www.instagram.com/reel/example-lucknow-vigil",
    thumbnail: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=720&q=70&auto=format&fit=crop",
    city: "Lucknow",
    state: "Uttar Pradesh",
    tags: ["lucknow", "vigil", "diyas", "peaceful"],
    hashtags: ["#LucknowVigil", "#Diyas", "#QuietProtest"],
    submittedBy: "@gpo.diary",
    submittedAt: "2025-06-03T18:30:00Z",
    views: 14_220,
    likes: 1_998,
    duration: 22,
    category: "candlelight"
  },
  {
    id: "v-009",
    title: "Ahmedabad Sabarmati Open Mic",
    description: "A poetry open mic on the Sabarmati riverfront, mic passed hand to hand.",
    url: "https://www.instagram.com/reel/example-ahmedabad-openmic",
    thumbnail: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=720&q=70&auto=format&fit=crop",
    city: "Ahmedabad",
    state: "Gujarat",
    category: "youth",
    tags: ["openmic", "poetry", "ahmedabad", "sabarmati"],
    hashtags: ["#OpenMic", "#Poetry", "#Sabarmati"],
    submittedBy: "@nadi.ki.baat",
    submittedAt: "2025-06-02T21:12:00Z",
    views: 38_410,
    likes: 5_022,
    duration: 73
  },
  {
    id: "v-010",
    title: "Srinagar Dal Lake Silent Float",
    description: "Boats carry candles and placards across Dal Lake at twilight.",
    url: "https://www.instagram.com/reel/example-srinagar-float",
    thumbnail: "https://images.unsplash.com/photo-1566837497312-7be4a47a1d70?w=720&q=70&auto=format&fit=crop",
    city: "Srinagar",
    state: "Jammu & Kashmir",
    category: "candlelight",
    tags: ["srinagar", "dal", "float", "twilight"],
    hashtags: ["#DalLake", "#SilentFloat", "#Kashmir"],
    submittedBy: "@jhelum.eye",
    submittedAt: "2025-06-01T19:50:00Z",
    views: 65_770,
    likes: 7_801,
    duration: 45
  },
  {
    id: "v-011",
    title: "Guwahati Brahmaputra Walk",
    description: "Walkers follow the river bank at sunrise, banners in hand.",
    url: "https://www.instagram.com/reel/example-guwahati-walk",
    thumbnail: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=720&q=70&auto=format&fit=crop",
    city: "Guwahati",
    state: "Assam",
    category: "marches",
    tags: ["guwahati", "brahmaputra", "sunrise", "march"],
    hashtags: ["#Brahmaputra", "#SunriseMarch", "#Assam"],
    submittedBy: "@north.east.daily",
    submittedAt: "2025-05-31T05:25:00Z",
    views: 28_120,
    likes: 3_590,
    duration: 39
  },
  {
    id: "v-012",
    title: "Bhopal Boat Club Press Conference",
    description: "Activists address a press gathering at the Boat Club.",
    url: "https://www.instagram.com/reel/example-bhopal-press",
    thumbnail: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=720&q=70&auto=format&fit=crop",
    city: "Bhopal",
    state: "Madhya Pradesh",
    category: "press",
    tags: ["bhopal", "press", "conference", "activists"],
    hashtags: ["#PressConf", "#Bhopal", "#SpeakUp"],
    submittedBy: "@central.rep",
    submittedAt: "2025-05-30T11:11:00Z",
    views: 18_402,
    likes: 1_402,
    duration: 81
  },
  {
    id: "v-013",
    title: "Thiruvananthapuram Beach Mural",
    description: "A 60-foot sand mural wiped clean by the tide the next morning.",
    url: "https://www.instagram.com/reel/example-thiru-mural",
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=720&q=70&auto=format&fit=crop",
    city: "Thiruvananthapuram",
    state: "Kerala",
    category: "art",
    tags: ["thiruvananthapuram", "beach", "mural", "sand"],
    hashtags: ["#BeachMural", "#Kerala", "#TideArt"],
    submittedBy: "@kerala.shoreline",
    submittedAt: "2025-05-29T08:08:00Z",
    views: 22_540,
    likes: 3_011,
    duration: 31
  },
  {
    id: "v-014",
    title: "Bhubaneswar Konark Sunset Chant",
    description: "A group gathers near Konark with lanterns and a single chant.",
    url: "https://www.instagram.com/reel/example-bhubaneswar-lanterns",
    thumbnail: "https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?w=720&q=70&auto=format&fit=crop",
    city: "Bhubaneswar",
    state: "Odisha",
    category: "candlelight",
    tags: ["bhubaneswar", "konark", "lanterns", "sunset"],
    hashtags: ["#Konark", "#Lanterns", "#Odisha"],
    submittedBy: "@odisha.diary",
    submittedAt: "2025-05-28T18:00:00Z",
    views: 12_900,
    likes: 1_410,
    duration: 26
  },
  {
    id: "v-015",
    title: "Indore Rajwada Students' Letter",
    description: "Students read a joint letter in a public square and pin it to a wall.",
    url: "https://www.instagram.com/reel/example-indore-letters",
    thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=720&q=70&auto=format&fit=crop",
    city: "Indore",
    state: "Madhya Pradesh",
    category: "youth",
    tags: ["indore", "students", "letter", "wall"],
    hashtags: ["#OpenLetter", "#Indore", "#Youth"],
    submittedBy: "@malwa.youth",
    submittedAt: "2025-05-27T14:00:00Z",
    views: 11_300,
    likes: 1_220,
    duration: 49
  },
  {
    id: "v-016",
    title: "Visakhapatnam Port Rally",
    description: "Fishermen and workers join a rally along the port road at dawn.",
    url: "https://www.instagram.com/reel/example-vizag-rally",
    thumbnail: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=720&q=70&auto=format&fit=crop",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    category: "rallies",
    tags: ["vizag", "port", "rally", "fishermen"],
    hashtags: ["#Vizag", "#PortRally", "#Workers"],
    submittedBy: "@kalinga.line",
    submittedAt: "2025-05-26T06:33:00Z",
    views: 21_770,
    likes: 2_700,
    duration: 55
  },
  {
    id: "v-017",
    title: "Patna Gandhi Maidan Sit-in",
    description: "A long, peaceful sit-in with placards and small tents.",
    url: "https://www.instagram.com/reel/example-patna-sitin",
    thumbnail: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=720&q=70&auto=format&fit=crop",
    city: "Patna",
    state: "Bihar",
    category: "rallies",
    tags: ["patna", "sitin", "gandhimaidan", "peaceful"],
    hashtags: ["#GandhiMaidan", "#SitIn", "#Bihar"],
    submittedBy: "@ganga.ki.reporter",
    submittedAt: "2025-05-25T13:18:00Z",
    views: 33_120,
    likes: 3_902,
    duration: 60
  },
  {
    id: "v-018",
    title: "Dehradun Tapovan Drum Circle",
    description: "A drum circle at Tapovan, songs about the hills, the river, the cause.",
    url: "https://www.instagram.com/reel/example-dehradun-drums",
    thumbnail: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=720&q=70&auto=format&fit=crop",
    city: "Dehradun",
    state: "Uttarakhand",
    category: "art",
    tags: ["dehradun", "tapovan", "drums", "songs"],
    hashtags: ["#DrumCircle", "#Tapovan", "#Songs"],
    submittedBy: "@ganga.source",
    submittedAt: "2025-05-24T17:55:00Z",
    views: 15_440,
    likes: 1_812,
    duration: 42
  }
];

export const VIDEOS: VideoEntry[] = [...REAL_VIDEOS, ...MOCK_VIDEOS];

export const ALL_TAGS = Array.from(new Set(VIDEOS.flatMap((v) => v.tags))).sort();

export const ALL_HASHTAGS = Array.from(new Set(VIDEOS.flatMap((v) => v.hashtags))).sort();

export type SortKey = "newest" | "oldest" | "most-viewed" | "most-liked" | "title-az" | "title-za";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "most-viewed", label: "Most viewed" },
  { value: "most-liked", label: "Most liked" },
  { value: "title-az", label: "Title A–Z" },
  { value: "title-za", label: "Title Z–A" }
];

export function getVideoById(id: string) {
  return VIDEOS.find((v) => v.id === id);
}

export function getCategoryById(id: VideoCategory) {
  return CATEGORIES.find((c) => c.id === id);
}
