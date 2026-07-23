'use client';

import type { JSX } from 'react';

import { Analytics } from '@vercel/analytics/next';

/**
 * Vercel Analytics component that tracks page views in production.
 *
 * @returns {JSX.Element} Rendered analytics script.
 */
export function VercelAnalytics(): JSX.Element {
  return <Analytics mode="production" />;
}
