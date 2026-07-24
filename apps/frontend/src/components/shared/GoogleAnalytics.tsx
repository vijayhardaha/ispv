'use client';

import type { JSX } from 'react';

import { GoogleAnalytics as NextGoogleAnalytics } from '@next/third-parties/google';

import { GOOGLE_ANALYTICS_ID } from '@/constants/seo';

/**
 * Google Analytics wrapper — only renders the GA script in production when GOOGLE_ANALYTICS_ID is set.
 *
 * @returns {JSX.Element | null} GA script elements or null.
 */
export function GoogleAnalytics(): JSX.Element | null {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  if (!GOOGLE_ANALYTICS_ID) {
    return null;
  }

  return <NextGoogleAnalytics gaId={GOOGLE_ANALYTICS_ID} />;
}
