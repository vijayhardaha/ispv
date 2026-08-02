import type { JSX } from 'react';

import { Container } from '@/components/ui/Container';

/**
 * Admin panel footer with branding and copyright notice.
 *
 * @returns {JSX.Element} Rendered footer element.
 */
export function AdminFooter(): JSX.Element {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <Container className="flex items-center justify-between py-4">
        <span className="text-sm font-bold tracking-tight uppercase">ISPV Admin</span>
        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()}{' '}
          <a
            href="https://ispv.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-pink-600"
          >
            Indian Students Protest Vault
          </a>
        </p>
      </Container>
    </footer>
  );
}
