/**
 * Category record shape used across the frontend for filtering and display.
 *
 * @type {DbCategory}
 * @property {string} slug - URL-safe category identifier.
 * @property {string} name - Display name for the category.
 * @property {string} tag - Short promotional tagline for the category.
 * @property {string} color - Theme colour key for the category.
 * @property {string | null} description - Detailed description of the category.
 */
export interface DbCategory {
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
    slug: 'police-conduct',
    name: 'Police Conduct',
    tag: 'On the Frontline',
    color: 'red',
    description:
      'Browse videos documenting police presence, crowd management, barricading, detentions, and alleged use of force during student protests across India. (भारत भर के छात्र विरोध प्रदर्शनों के दौरान पुलिस उपस्थिति, भीड़ प्रबंधन, बैरिकेडिंग, हिरासत और कथित बल प्रयोग को दर्शाने वाले वीडियो देखें।)',
  },
  {
    slug: 'gen-z-moments',
    name: 'Gen Z Moments',
    tag: 'Generation Speaks',
    color: 'green',
    description:
      'Discover videos highlighting the leadership, creativity, participation, and voices of Gen Z students during peaceful protests and public movements. (शांतिपूर्ण विरोध प्रदर्शनों और जन आंदोलनों के दौरान जेन ज़ेड छात्रों के नेतृत्व, रचनात्मकता, भागीदारी और आवाज़ को उजागर करने वाले वीडियो खोजें।)',
  },
  {
    slug: 'protest-marches',
    name: 'Protest Marches',
    tag: 'Voices in Motion',
    color: 'yellow',
    description:
      'Explore publicly shared videos of protest marches across India, featuring peaceful rallies, processions, public gatherings, patriotic songs, and community participation. (पूरे भारत में विरोध मार्चों के सार्वजनिक रूप से साझा किए गए वीडियो देखें, जिनमें शांतिपूर्ण रैलियाँ, जुलूस, सार्वजनिक सभाएँ, देशभक्ति गीत और सामुदायिक भागीदारी शामिल हैं।)',
  },
  {
    slug: 'protest-vlogs',
    name: 'Protest Vlogs',
    tag: 'Through Their Lens',
    color: 'white',
    description:
      'Explore personal vlog style videos documenting journeys, behind the scenes moments, daily experiences, and firsthand accounts from protest participants. (विरोध प्रदर्शनों में भाग लेने वालों की यात्राओं, पर्दे के पीछे के पलों, दैनिक अनुभवों और प्रत्यक्ष विवरणों को दर्शाने वाले व्यक्तिगत व्लॉग शैली के वीडियो देखें।)',
  },
  {
    slug: 'news-coverage',
    name: 'News Coverage',
    tag: 'In the Headlines',
    color: 'black',
    description:
      'Browse television reports, digital news clips, interviews, debates, and media coverage documenting student protests and related developments. (छात्र विरोध प्रदर्शनों और संबंधित घटनाक्रमों को दर्शाने वाली टेलीविज़न रिपोर्ट, डिजिटल समाचार क्लिप, साक्षात्कार, बहसें और मीडिया कवरेज देखें।)',
  },
  {
    slug: 'public-figures-creators',
    name: 'Public Figures & Creators',
    tag: 'Public Voices',
    color: 'green',
    description:
      'Watch videos shared by influencers, journalists, actors, educators, activists, and other public figures documenting or supporting student protests. (प्रभावशाली लोगों, पत्रकारों, अभिनेताओं, शिक्षकों, कार्यकर्ताओं और अन्य सार्वजनिक हस्तियों द्वारा छात्र विरोध प्रदर्शनों का दस्तावेज़ीकरण या समर्थन करने वाले साझा वीडियो देखें।)',
  },
  {
    slug: 'acts-of-kindness',
    name: 'Acts of Kindness',
    tag: 'Humanity First',
    color: 'blue',
    description:
      'Discover inspiring moments of compassion, solidarity, volunteer support, food distribution, medical assistance, and kindness shared during protests. (विरोध प्रदर्शनों के दौरान साझा की गई करुणा, एकजुटता, स्वयंसेवक सहायता, भोजन वितरण, चिकित्सा सहायता और दयालुता के प्रेरक क्षण खोजें।)',
  },
  {
    slug: 'counter-protests-public-reactions',
    name: 'Counter Protests & Public Reactions',
    tag: 'Different Perspectives',
    color: 'yellow',
    description:
      'Explore videos documenting counter demonstrations, differing viewpoints, public reactions, debates, and discussions surrounding student protests. (छात्र विरोध प्रदर्शनों से जुड़े प्रति-प्रदर्शन, अलग-अलग दृष्टिकोण, जन प्रतिक्रियाएँ, बहसें और चर्चाएँ दर्शाने वाले वीडियो देखें।)',
  },
  {
    slug: 'official-statements',
    name: 'Official Statements',
    tag: 'From the Organizers',
    color: 'blue',
    description:
      'Explore official announcements, press briefings, speeches, campaign updates, and public statements shared by protest organizers and representatives. (विरोध प्रदर्शन आयोजकों और प्रतिनिधियों द्वारा साझा किए गए आधिकारिक घोषणाओं, प्रेस वार्ताओं, भाषणों, अभियान अपडेट और सार्वजनिक बयानों को देखें।)',
  },
  {
    slug: 'women-leading-movement',
    name: 'Women Leading the Movement',
    tag: 'Leading the Change',
    color: 'yellow',
    description:
      'Explore videos highlighting women leading marches, organizing events, delivering speeches, coordinating volunteers, and inspiring peaceful public participation. (मार्च का नेतृत्व करने, कार्यक्रम आयोजित करने, भाषण देने, स्वयंसेवकों का समन्वय करने और शांतिपूर्ण जन भागीदारी को प्रेरित करने वाली महिलाओं को उजागर करने वाले वीडियो देखें।)',
  },
  {
    slug: 'human-rights',
    name: 'Human Rights',
    tag: 'Rights & Freedom',
    color: 'red',
    description:
      'Explore videos documenting alleged human rights concerns, civil liberties issues, public accountability, and reported incidents during student protests. (छात्र विरोध प्रदर्शनों के दौरान कथित मानवाधिकार चिंताओं, नागरिक स्वतंत्रता मुद्दों, सार्वजनिक जवाबदेही और रिपोर्ट की गई घटनाओं को दर्शाने वाले वीडियो देखें।)',
  },
  {
    slug: 'solidarity-protection',
    name: 'Solidarity & Protection',
    tag: 'Standing Together',
    color: 'red',
    description:
      'Watch videos showing protesters protecting one another, supporting vulnerable participants, forming human chains, and demonstrating unity during protests. (विरोध प्रदर्शनों के दौरान प्रदर्शनकारियों को एक-दूसरे की रक्षा करते, कमज़ोर प्रतिभागियों का समर्थन करते, मानव श्रृंखला बनाते और एकता प्रदर्शित करते दिखाने वाले वीडियो देखें।)',
  },
  {
    slug: 'senior-citizens-voices',
    name: "Senior Citizens' Voices",
    tag: 'Wisdom Speaks',
    color: 'black',
    description:
      'Discover speeches, interviews, and heartfelt messages from senior citizens sharing support, advice, and perspectives on student movements across India. (भारत भर के छात्र आंदोलनों पर समर्थन, सलाह और दृष्टिकोण साझा करने वाले वरिष्ठ नागरिकों के भाषण, साक्षात्कार और हार्दिक संदेश खोजें।)',
  },
  {
    slug: 'children-voices',
    name: "Children's Voices",
    tag: 'Voices of Tomorrow',
    color: 'white',
    description:
      'Browse publicly shared videos featuring children expressing messages of hope, participation, awareness, and support alongside peaceful public demonstrations. (शांतिपूर्ण सार्वजनिक प्रदर्शनों के साथ आशा, भागीदारी, जागरूकता और समर्थन के संदेश व्यक्त करने वाले बच्चों के सार्वजनिक रूप से साझा किए गए वीडियो देखें।)',
  },
  {
    slug: 'celebrations-cultural-events',
    name: 'Celebrations & Cultural Events',
    tag: 'Culture & Unity',
    color: 'green',
    description:
      'Discover patriotic songs, cultural performances, celebrations, street art, poetry, music, and creative expressions shared during student protests. (छात्र विरोध प्रदर्शनों के दौरान साझा किए गए देशभक्ति गीत, सांस्कृतिक प्रस्तुतियाँ, समारोह, सड़क कला, कविता, संगीत और रचनात्मक अभिव्यक्तियाँ खोजें।)',
  },
  {
    slug: 'night-updates',
    name: 'Night Updates',
    tag: 'After Sunset',
    color: 'black',
    description:
      'Explore videos from evening and overnight protests, including speeches, volunteer activities, and updates from protest locations. (शाम और रात भर चलने वाले विरोध प्रदर्शनों के वीडियो देखें, जिनमें भाषण, स्वयंसेवक गतिविधियाँ और विरोध स्थलों से अपडेट शामिल हैं।)',
  },
  {
    slug: 'media-analysis',
    name: 'Media Analysis',
    tag: 'Media Under Review',
    color: 'blue',
    description:
      'Browse videos discussing, comparing, or analyzing media coverage, reporting styles, public criticism, and journalism related to student protests. (छात्र विरोध प्रदर्शनों से संबंधित मीडिया कवरेज, रिपोर्टिंग शैलियों, जन आलोचना और पत्रकारिता पर चर्चा, तुलना या विश्लेषण करने वाले वीडियो देखें।)',
  },
  {
    slug: 'other',
    name: 'Other',
    tag: 'More Stories',
    color: 'gray',
    description: 'Uncategorised protest content. (अवर्गीकृत विरोध सामग्री।)',
  },
];

/**
 * Category slugs highlighted as featured on the homepage.
 */
export const FEATURED_CATEGORIES_SLUGS = [
  'protest-marches',
  'police-conduct',
  'gen-z-moments',
  'news-coverage',
  'human-rights',
  'women-leading-movement',
];
