import type { JSX, ReactNode } from 'react';

import type { Metadata } from 'next';
import { JetBrains_Mono, Poppins, Space_Grotesk } from 'next/font/google';
import Link from 'next/link';

import { LogoutButton } from '@/components/LogoutButton';
import { Container } from '@/components/ui/Container';
import { HEADER_NAV_LINKS } from '@/constants/navlinks';
import { SITE_METADATA } from '@/constants/seo';
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
 * Site-wide metadata for the admin panel using SEO configuration.
 */
export const metadata: Metadata = SITE_METADATA;

/**
 * Root layout with authentication-aware navigation bar using shared NAV_LINKS constant.
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
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[100] focus:border-2 focus:border-black focus:bg-yellow-400 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-black focus:uppercase"
        >
          Skip to content
        </a>
        {user && (
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
        )}
        <main id="main-content" tabIndex={-1} className="flex-1">
          <Container>
            <Providers>{children}</Providers>
          </Container>
        </main>

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
      </body>
    </html>
  );
}
