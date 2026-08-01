import { revalidateTag } from 'next/cache';

/**
 * Cache tag used to invalidate the cached dashboard stats on video mutations.
 */
export const DASHBOARD_STATS_TAG = 'dashboard-stats';

/**
 * Seconds the cached dashboard stats stay fresh before revalidation.
 */
export const DASHBOARD_STATS_REVALIDATE_SECONDS = 60;

/**
 * Invalidates the cached dashboard stats so the next read is fresh.
 */
export function revalidateDashboardStats(): void {
  revalidateTag(DASHBOARD_STATS_TAG, { expire: DASHBOARD_STATS_REVALIDATE_SECONDS });
}
