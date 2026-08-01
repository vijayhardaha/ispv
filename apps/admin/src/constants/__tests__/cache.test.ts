import { revalidateTag } from 'next/cache';
import { describe, expect, it } from 'vitest';

import { DASHBOARD_STATS_REVALIDATE_SECONDS, DASHBOARD_STATS_TAG, revalidateDashboardStats } from '../cache';

describe('cache constants', () => {
  it('defines the dashboard stats cache tag', () => {
    expect(DASHBOARD_STATS_TAG).toBe('dashboard-stats');
  });

  it('defines the revalidation window in seconds', () => {
    expect(DASHBOARD_STATS_REVALIDATE_SECONDS).toBe(60);
  });
});

describe('revalidateDashboardStats', () => {
  it('revalidates the dashboard stats tag with the configured window', () => {
    revalidateDashboardStats();
    expect(revalidateTag).toHaveBeenCalledWith(DASHBOARD_STATS_TAG, { expire: DASHBOARD_STATS_REVALIDATE_SECONDS });
  });
});
