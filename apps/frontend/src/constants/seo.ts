import { CREATOR, type CreatorConfig } from '@vijayhardaha/schema-builder';
import type { Metadata } from 'next';

/**
 * Google Analytics measurement ID. Set to an empty string to disable GA.
 * Only activates in production when a non-empty ID is provided.
 */
export const GOOGLE_ANALYTICS_ID = '';

/**
 * Google Search Console verification code for the site.
 */
const GOOGLE_SITE_VERIFICATION = '4CyrCxZi9TWgvS-GzB1QUhgEl0bKoIzT36368e_vlx0';

/**
 * Site-wide configuration values for SEO and metadata.
 */
export const SITE_CONFIG = {
  name: 'Indian Students Protest Vault',
  title: 'Indian Students Protest Vault — A Peaceful Protest Archive',
  url: 'https://ispv.vercel.app',
  description:
    'A peaceful, non-partisan archive of Indian protest reels from Instagram. Browse by city, category, or hashtag. Preserving publicly shared videos documenting student protests across India.',
  category: 'Archives',
  classification: 'Video Archive, Protest Documentation, Digital Archive, Student Movement Archive',
  creator: CREATOR as CreatorConfig,
  organization: {
    name: 'Indian Students Protest Vault',
    description:
      'Indian Students Protest Vault is an independent archive of publicly shared videos documenting student protests across India, organised by city, category, and event.',
  },
};

/**
 * SEO keywords for the website.
 */
const SEO_KEYWORDS = [
  'indian student protests',
  'student protest archive',
  'peaceful protest india',
  'indian protest reels',
  'student movement india',
  'protest video archive',
  'india student demonstrations',
  'cockroach janta party',
  'cjp protests',
  'indian youth movement',
  'student protest documentation',
  'india protest 2026',
  'student rally india',
  'peaceful demonstration archive',
  'indian protest videos',
  'campus protests india',
  'student voices india',
  'protest archive india',
];

/**
 * Default image metadata for Open Graph and Twitter cards.
 */
const seoImage = {
  url: '/og/preview.png',
  secureUrl: '/og/preview.png',
  alt: 'Indian Students Protest Vault Thumbnail',
  width: 1200,
  height: 630,
  type: 'image/png',
};

/**
 * Title and description used for SEO, Open Graph, and Twitter cards.
 */
const titleAndDescription = { title: SITE_CONFIG.title, description: SITE_CONFIG.description };

/**
 * The main metadata object containing all SEO-related information for the website.
 */
export const SITE_METADATA: Metadata = {
  ...titleAndDescription,
  keywords: SEO_KEYWORDS,
  applicationName: SITE_CONFIG.name,
  authors: [{ name: SITE_CONFIG.creator.name, url: SITE_CONFIG.creator.urls.gravatar }],
  creator: SITE_CONFIG.creator.name,
  publisher: SITE_CONFIG.name,
  robots: { index: true, follow: true },
  category: SITE_CONFIG.category,
  classification: SITE_CONFIG.classification,
  verification: { google: GOOGLE_SITE_VERIFICATION },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    ...titleAndDescription,
    images: seoImage,
    type: 'website',
    siteName: SITE_CONFIG.name,
    locale: 'en_US',
    url: SITE_CONFIG.url,
  },
  twitter: {
    ...titleAndDescription,
    card: 'summary_large_image',
    images: seoImage,
    creator: SITE_CONFIG.creator.handles[0],
  },
  other: { lang: 'en' },
};
