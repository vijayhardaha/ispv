import type { ReactNode, JSX } from 'react';

import type { Metadata } from 'next';
import { Space_Grotesk, Poppins, JetBrains_Mono } from 'next/font/google';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { GoogleAnalytics } from '@/components/shared/GoogleAnalytics';
import { ReelPlayerProvider } from '@/components/shared/ReelPlayerProvider';
import { VercelAnalytics } from '@/components/shared/VercelAnalytics';
import { SITE_METADATA } from '@/constants/seo';
import '@/globals.css';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

/**
 * Global metadata for the Protest Vault site using site-wide SEO configuration.
 */
export const metadata: Metadata = SITE_METADATA;

/**
 * Root layout wrapping all pages with Header, Footer, font configuration, and JSON-LD structured data.
 *
 * @param {object} props - Layout properties.
 * @param {object} props.children - Page content to render.
 *
 * @returns {JSX.Element} Rendered HTML document with header, main, footer, and schema markup.
 */
export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${poppins.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body bg-gray-100 text-black antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[100] focus:border-2 focus:border-black focus:bg-yellow-400 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-black focus:uppercase"
        >
          Skip to content
        </a>
        <div id="main-content" tabIndex={-1} className="flex min-h-screen flex-col">
          <ReelPlayerProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </ReelPlayerProvider>
        </div>
        <GoogleAnalytics />
        <VercelAnalytics />
      </body>
    </html>
  );
}
