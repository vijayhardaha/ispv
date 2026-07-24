/**
 * All possible video statuses for filtering, including empty string for "All" and "trashed".
 */
export const STATUSES = ['', 'draft', 'pending_review', 'published', 'rejected', 'trashed'] as const;

/**
 * Human-readable labels for each video status value.
 */
export const STATUS_LABELS: Record<string, string> = {
  '': 'All',
  draft: 'Draft',
  pending_review: 'Pending',
  published: 'Published',
  rejected: 'Rejected',
  trashed: 'Trashed',
};

/**
 * Valid status values for bulk updates, in display order.
 */
export const BULK_STATUS_OPTIONS = ['draft', 'pending_review', 'published', 'rejected'] as const;
