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
