import type { ReactNode, JSX } from 'react';

import type { Metadata } from 'next';
import { Space_Grotesk, Poppins, JetBrains_Mono } from 'next/font/google';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import '@/index.css';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: "Protest Vault — India's peaceful protest archive",
  description:
    'A peaceful, non-partisan archive of Indian protest reels from Instagram. Browse by city, category, or hashtag.',
};

/**
 * Root layout wrapping all pages with Header, Footer, and font configuration.
 *
 * @param {object} props - Layout properties.
 * @param {object} props.children - Page content to render.
 *
 * @returns {JSX.Element} Rendered HTML document with header, main, and footer.
 */
export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${poppins.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body bg-gray-100 text-black antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
