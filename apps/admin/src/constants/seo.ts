import type { Metadata } from 'next';

/**
 * Creator profile for the admin panel metadata.
 */
const CREATOR = {
  name: 'Vijay Hardaha',
  urls: { gravatar: 'https://github.com/vijayhardaha/' },
  handles: ['@vijayhardaha'],
};

/**
 * Site-wide configuration values for SEO and metadata.
 */
export const SITE_CONFIG = {
  name: 'ISPV Admin',
  title: 'ISPV Admin — Video Archive Management',
  url: 'https://ispv.vercel.app',
  description: 'Admin panel for managing the Indian Students Protest Vault archive.',
  creator: CREATOR,
};

/**
 * The main metadata object for the admin panel.
 */
export const SITE_METADATA: Metadata = {
  title: { default: SITE_CONFIG.name, template: `%s - ${SITE_CONFIG.name}` },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.name,
  authors: [{ name: SITE_CONFIG.creator.name, url: SITE_CONFIG.creator.urls.gravatar }],
  creator: SITE_CONFIG.creator.name,
  publisher: SITE_CONFIG.name,
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    type: 'website',
    siteName: SITE_CONFIG.name,
    locale: 'en_US',
    url: SITE_CONFIG.url,
  },
  twitter: {
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    card: 'summary_large_image',
    creator: SITE_CONFIG.creator.handles[0],
  },
  other: { lang: 'en' },
};
