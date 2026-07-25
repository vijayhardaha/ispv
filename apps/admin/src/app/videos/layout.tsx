import type { JSX, ReactNode } from 'react';

import type { Metadata } from 'next';

/**
 * Videos management page metadata.
 */
export const metadata: Metadata = { title: 'Videos' };

/**
 * Wraps the videos management page with metadata.
 *
 * @param {{ children: ReactNode }} props - Component properties.
 * @param {ReactNode} props.children - The videos page content.
 *
 * @returns {JSX.Element} Rendered children.
 */
export default function VideosLayout({ children }: { children: ReactNode }): JSX.Element {
  return <>{children}</>;
}
