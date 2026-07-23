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
 * Navigation links displayed in the admin panel header.
 *
 * @type {NavLink[]}
 */
export const HEADER_NAV_LINKS: NavLink[] = [
  { label: 'Dashboard', href: '/' },
  { label: 'Videos', href: '/videos' },
  { label: 'Categories', href: '/categories' },
  { label: 'Locations', href: '/locations' },
];
