import type { JSX } from 'react';

import { Container } from '@/components/ui/Container';

/**
 * Admin panel footer with branding and copyright notice.
 *
 * @returns {JSX.Element} Rendered footer element.
 */
export function AdminFooter(): JSX.Element {
  return (
    <footer className="border-t-2 border-black bg-white">
      <Container className="flex items-center justify-between py-4">
        <span className="font-display text-xs font-extrabold tracking-tight uppercase">ISPV Admin</span>
        <p className="text-xs text-black/50">
          &copy; {new Date().getFullYear()}{' '}
          <a
            href="https://ispv.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-yellow-500"
          >
            Indian Students Protest Vault
          </a>
        </p>
      </Container>
    </footer>
  );
}
