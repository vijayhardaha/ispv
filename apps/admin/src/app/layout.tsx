import type { JSX, ReactNode } from 'react';

import type { Metadata } from 'next';
import { JetBrains_Mono, Poppins, Space_Grotesk } from 'next/font/google';
import Link from 'next/link';

import { LogoutButton } from '@/components/LogoutButton';
import { Container } from '@/components/ui/Container';
import { createServerSupabase } from '@/lib/supabase-server';

import './globals.css';
import { Providers } from './Providers';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

/**
 * Default metadata for all admin pages.
 */
export const metadata: Metadata = {
  title: { default: 'Reel Vault Admin', template: '%s - Reel Vault Admin' },
  description: 'Admin panel for managing the Indian Students Protest Vault archive.',
};

/**
 * Root layout with authentication-aware navigation bar.
 *
 * @param {{ children: ReactNode }} props - Component properties.
 * @param {ReactNode} props.children - Page content to render.
 *
 * @returns {Promise<JSX.Element>} Rendered layout.
 */
export default async function RootLayout({ children }: { children: ReactNode }): Promise<JSX.Element> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${poppins.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body flex min-h-screen flex-col bg-gray-100 text-black antialiased">
        {user && (
          <header>
            <nav className="border-b-2 border-black bg-white py-3" aria-label="Main navigation">
              <Container className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <span className="font-display text-sm font-extrabold uppercase">Reel Vault Admin</span>
                  <Link href="/" className="text-xs font-bold uppercase hover:text-yellow-500">
                    Dashboard
                  </Link>
                  <Link href="/videos" className="text-xs font-bold uppercase hover:text-yellow-500">
                    Videos
                  </Link>
                  <Link href="/categories" className="text-xs font-bold uppercase hover:text-yellow-500">
                    Categories
                  </Link>
                  <Link href="/locations" className="text-xs font-bold uppercase hover:text-yellow-500">
                    Locations
                  </Link>
                </div>
                <LogoutButton />
              </Container>
            </nav>
          </header>
        )}
        <main className="flex-1">
          <Container>
            <Providers>{children}</Providers>
          </Container>
        </main>

        <footer className="border-t-2 border-black bg-white">
          <Container className="flex items-center justify-between py-4">
            <span className="font-display text-xs font-extrabold tracking-tight uppercase">Reel Vault Admin</span>
            <p className="text-xs text-black/50">&copy; {new Date().getFullYear()} Indian Students Protest Vault</p>
          </Container>
        </footer>
      </body>
    </html>
  );
}
