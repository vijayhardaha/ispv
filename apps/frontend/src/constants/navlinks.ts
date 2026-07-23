/**
 * Navigation link structure for header and footer.
 *
 * @type {NavLink}
 * @property {string} label - The display text for the link.
 * @property {string} href - The URL the link points to.
 */
export interface NavLink {
  label: string;
  href: string;
}

/**
 * Internal navigation link with optional anchor support.
 *
 * @type {FooterInfoLink}
 * @augments NavLink
 * @property {boolean} [isAnchor] - Whether to render as plain anchor instead of Next Link.
 */
export interface FooterInfoLink extends NavLink {
  isAnchor?: boolean;
}

/**
 * Navigation links displayed in the header of the website.
 *
 * @type {NavLink[]}
 */
export const HEADER_NAV_LINKS: NavLink[] = [
  { label: 'Why Protest', href: '/why-students-are-protesting' },
  { label: 'All Videos', href: '/videos' },
  { label: 'Categories', href: '/categories' },
  { label: 'About', href: '/about' },
];

/**
 * Internal info links displayed in the footer Info column.
 *
 * @type {FooterInfoLink[]}
 */
export const FOOTER_INFO_LINKS: FooterInfoLink[] = [
  { label: 'About the project', href: '/about' },
  { label: 'Browse categories', href: '/categories' },
  { label: 'All videos', href: '/videos' },
  { label: 'Sitemap', href: '/sitemap' },
  { label: 'DMCA', href: '/dmca' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

/**
 * External useful links displayed in the footer Useful Links column.
 *
 * @type {NavLink[]}
 */
export const FOOTER_USEFUL_LINKS: NavLink[] = [
  { label: 'CJP (Cockroach Janta Party) Instagram', href: 'https://www.instagram.com/cockroachjantaparty/' },
  { label: 'BBC Search: CJP', href: 'https://www.bbc.com/search?q=cjp' },
  { label: 'The News Pinch on YouTube', href: 'https://www.youtube.com/@TheNewsPinch/videos' },
  { label: 'Bolta Hindustan on YouTube', href: 'https://www.youtube.com/@BoltaHindustan/videos' },
  { label: 'Scroll.in search: protest', href: 'https://scroll.in/search?q=protest&page=1' },
];

/**
 * External resource links displayed in the footer Resources column.
 *
 * @type {NavLink[]}
 */
export const FOOTER_RESOURCE_LINKS: NavLink[] = [
  { label: 'Know India — Government of India', href: 'https://knowindia.india.gov.in/' },
  { label: 'Freedom of speech in India', href: 'https://en.wikipedia.org/wiki/Freedom_of_speech_in_India' },
  { label: 'CJP Official Website', href: 'https://cockroachjanata.org/' },
  { label: 'Ministry of Education, Government of India', href: 'https://www.education.gov.in' },
];

/**
 * Bottom bar links displayed in the footer copyright row.
 *
 * @type {NavLink[]}
 */
export const FOOTER_BOTTOM_LINKS: NavLink[] = [
  { label: 'Sitemap', href: '/sitemap' },
  { label: 'DMCA', href: '/dmca' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];
