import type { JSX } from 'react';

import Link from 'next/link';

import { LogoutButton } from '@/components/LogoutButton';
import { Container } from '@/components/ui/Container';
import { HEADER_NAV_LINKS } from '@/constants/navlinks';

/**
 * Admin panel header with navigation links and a logout button.
 * Only rendered when a user is authenticated (controlled by the parent layout).
 *
 * @returns {JSX.Element} Rendered header element.
 */
export function AdminHeader(): JSX.Element {
  return (
    <header>
      <nav className="border-b-2 border-black bg-white py-3" aria-label="Main navigation">
        <Container className="flex items-center justify-between gap-6 text-lg">
          <p className="font-display text-2xl font-extrabold uppercase">ISPV Admin</p>
          <div className="flex items-center gap-4">
            {HEADER_NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="font-bold uppercase hover:text-yellow-500">
                {link.label}
              </Link>
            ))}
          </div>
          <div>
            <LogoutButton />
          </div>
        </Container>
      </nav>
    </header>
  );
}
