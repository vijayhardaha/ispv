'use client';

import type { JSX } from 'react';

import { Analytics } from '@vercel/analytics/next';

/**
 * Vercel Analytics component that tracks page views in production.
 *
 * @returns {JSX.Element | null} Rendered analytics script.
 */
export function VercelAnalytics(): JSX.Element | null {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return <Analytics mode="production" />;
}
