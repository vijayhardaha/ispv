/**
 * Navigation link structure for the admin sidebar.
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
 * Navigation links displayed in the admin panel sidebar.
 *
 * @type {NavLink[]}
 */
export const SIDEBAR_NAV_LINKS: NavLink[] = [
  { label: 'Dashboard', href: '/' },
  { label: 'Videos', href: '/videos' },
];
