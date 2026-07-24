import { describe, expect, it } from 'vitest';

import { BULK_STATUS_OPTIONS, STATUSES, STATUS_LABELS } from '../status';

describe('STATUSES', () => {
  it('contains all possible status values including empty string for All', () => {
    expect(STATUSES).toEqual(['', 'draft', 'pending_review', 'published', 'rejected', 'trashed']);
  });

  it('includes trashed status', () => {
    expect(STATUSES).toContain('trashed');
  });

  it('empty string is first for All filter', () => {
    expect(STATUSES[0]).toBe('');
  });
});

describe('STATUS_LABELS', () => {
  it('returns human-readable label for each status', () => {
    expect(STATUS_LABELS['']).toBe('All');
    expect(STATUS_LABELS.draft).toBe('Draft');
    expect(STATUS_LABELS.pending_review).toBe('Pending');
    expect(STATUS_LABELS.published).toBe('Published');
    expect(STATUS_LABELS.rejected).toBe('Rejected');
    expect(STATUS_LABELS.trashed).toBe('Trashed');
  });

  it('covers every value in STATUSES', () => {
    for (const s of STATUSES) {
      expect(STATUS_LABELS[s]).toBeDefined();
    }
  });

  it('has no extra keys beyond STATUSES', () => {
    expect(Object.keys(STATUS_LABELS).length).toBe(STATUSES.length);
  });
});

describe('BULK_STATUS_OPTIONS', () => {
  it('contains non-trashed statuses for bulk updates', () => {
    expect(BULK_STATUS_OPTIONS).toEqual(['draft', 'pending_review', 'published', 'rejected']);
  });

  it('excludes trashed and empty string', () => {
    expect(BULK_STATUS_OPTIONS).not.toContain('');
    expect(BULK_STATUS_OPTIONS).not.toContain('trashed');
  });

  it('is a subset of STATUSES', () => {
    for (const opt of BULK_STATUS_OPTIONS) {
      expect(STATUSES).toContain(opt);
    }
  });
});
