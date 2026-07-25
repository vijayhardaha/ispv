import type { JSX, ReactNode } from 'react';

import type { Metadata } from 'next';

/**
 * Login page metadata.
 */
export const metadata: Metadata = { title: 'Login' };

/**
 * Wraps the login page with metadata.
 *
 * @param {{ children: ReactNode }} props - Component properties.
 * @param {ReactNode} props.children - The login page content.
 *
 * @returns {JSX.Element} Rendered children.
 */
export default function LoginLayout({ children }: { children: ReactNode }): JSX.Element {
  return <>{children}</>;
}
