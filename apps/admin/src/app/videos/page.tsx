'use client';

import { useState, useEffect, useCallback, useRef, Suspense, type JSX } from 'react';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { useToast } from '@/components/Toast';
import { Button } from '@/components/ui/Button';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { VideoFormModal } from '@/components/VideoFormModal';
import { CATEGORIES } from '@/constants/categories';
import { TAG_VARIANTS, type TagVariant } from '@/constants/colors';
import { LOCATIONS } from '@/constants/locations';
import { usePagination } from '@/hooks/usePagination';
import { cn } from '@/lib/cn';
import { displayVideoUrl } from '@/lib/instagram';
import { getVideosForApi } from '@/lib/rpc';
import { createClient } from '@/lib/supabase';
import type { VideoRecord } from '@/lib/types';

/**
 * All possible video statuses for filtering, including empty string for "All".
 */
const STATUSES = ['', 'draft', 'pending_review', 'published', 'rejected'] as const;

/**
 * Human-readable labels for each video status value.
 */
const STATUS_LABELS: Record<string, string> = {
  '': 'All',
  draft: 'Draft',
  pending_review: 'Pending',
  published: 'Published',
  rejected: 'Rejected',
};

/**
 * Number of videos displayed per page in the table.
 */
const PER_PAGE = 15;

/** Valid status values for bulk updates, in display order. */
const BULK_STATUS_OPTIONS = ['draft', 'pending_review', 'published', 'rejected'] as const;

/**
 * Videos management page with filtering, pagination, bulk operations, and CRUD.
 *
 * @returns {JSX.Element} Rendered videos page.
 */
export default function VideosPage(): JSX.Element {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading...</div>}>
      <VideosPageContent />
    </Suspense>
  );
}

/**
 * Inner component that uses URL-based search params for status filtering and pagination.
 *
 * @returns {JSX.Element} Rendered videos page content with table, filters, and modals.
 */
function VideosPageContent(): JSX.Element {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [categories] = useState(CATEGORIES);
  const [states] = useState(LOCATIONS);
  const [editVideo, setEditVideo] = useState<VideoRecord | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [changingStatus, setChangingStatus] = useState<Set<string>>(new Set());
  const selectAllRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { toast } = useToast();
  const { page, goToPage } = usePagination();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = searchParams.get('status') || '';
  const search = searchParams.get('q') || '';

  const setStatus = useCallback(
    (newStatus: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newStatus) {
        params.set('status', newStatus);
      } else {
        params.delete('status');
      }
      params.delete('page');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams]
  );

  const loadData = useCallback(async () => {
    const response = await getVideosForApi(supabase, {
      status: status || null,
      search: search || null,
      page,
      per_page: PER_PAGE,
    });

    if (response) {
      setVideos(response.data);
      setTotalCount(response.pagination.total_count);
    }
    setSelectedIds(new Set());
  }, [status, search, page, supabase]);

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  /** Update the indeterminate state of the select-all checkbox. */
  useEffect(() => {
    const el = selectAllRef.current;
    if (!el) {
      return;
    }
    const someSelected = selectedIds.size > 0 && selectedIds.size < videos.length;
    el.indeterminate = someSelected;
  }, [selectedIds, videos.length]);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(new Set(videos.map((v) => v.id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [videos]
  );

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleApplyBulk = useCallback(async () => {
    setBulkLoading(true);
    const ids = Array.from(selectedIds);
    setBulkAction('');

    let action: string;
    let body: Record<string, unknown>;

    if (bulkAction === 'delete') {
      action = 'delete';
      body = { action, ids };
    } else {
      action = 'update_status';
      body = { action, ids, status: bulkAction };
    }

    const res = await fetch('/api/auth/videos/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setBulkLoading(false);

    if (res.ok) {
      const label = bulkAction === 'delete' ? 'deleted' : `updated to ${STATUS_LABELS[bulkAction] ?? bulkAction}`;
      toast(`${ids.length} video(s) ${label}`, 'success');
      setSelectedIds(new Set());
      loadData();
    } else {
      const err = await res.json().catch(() => ({ error: 'Bulk operation failed' }));
      toast(err.error || 'Bulk operation failed', 'error');
    }
  }, [selectedIds, bulkAction, toast, loadData]);

  const handleInlineStatusChange = useCallback(
    async (id: string, newStatus: string) => {
      setChangingStatus((prev) => new Set(prev).add(id));
      const res = await fetch(`/api/auth/videos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setChangingStatus((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (res.ok) {
        toast(`Status updated to ${STATUS_LABELS[newStatus] ?? newStatus}`, 'success');
        loadData();
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to update status' }));
        toast(err.error || 'Failed to update status', 'error');
      }
    },
    [toast, loadData]
  );

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/auth/videos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast('Video deleted', 'success');
      setDeleteConfirm(null);
      loadData();
    } else {
      toast('Failed to delete video', 'error');
    }
  };

  const allSelected = videos.length > 0 && selectedIds.size === videos.length;
  const totalPages = Math.ceil(totalCount / PER_PAGE);

  return (
    <section className="py-8" aria-labelledby="videos-heading">
      <header className="mb-6 flex items-center justify-between">
        <h1 id="videos-heading" className="text-3xl font-extrabold uppercase">
          Videos
        </h1>
        <Button onClick={() => setShowAdd(true)}>+ Add</Button>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput placeholder="Search videos…" />
        <Select
          variant="filter"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Status filter"
          options={STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
        />
      </div>

      {/* Bulk actions toolbar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 border-2 border-black bg-yellow-100 px-4 py-3">
          <span className="text-sm font-bold uppercase">{selectedIds.size} selected</span>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              variant="bulk"
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              disabled={bulkLoading}
            >
              <option value="">Bulk action…</option>
              <option value="delete">Delete</option>
              <optgroup label="Change status to…">
                {BULK_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </optgroup>
            </Select>

            <Button
              size="sm"
              variant={bulkAction === 'delete' ? 'danger' : 'primary'}
              disabled={!bulkAction || bulkLoading}
              loading={bulkLoading}
              onClick={handleApplyBulk}
            >
              Apply
            </Button>

            <Button size="sm" variant="secondary" disabled={bulkLoading} onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto border-2 border-black bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b-2 border-black bg-gray-100">
            <tr>
              <th className="w-10 px-3 py-2">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer accent-yellow-500"
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  aria-label="Select all videos"
                />
              </th>
              <th className="w-16 px-3 py-2 text-xs font-bold uppercase">Thumb</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">URL</th>
              <th className="w-28 px-3 py-2 text-xs font-bold uppercase">City</th>
              <th className="w-28 px-3 py-2 text-xs font-bold uppercase">Category</th>
              <th className="w-24 px-3 py-2 text-xs font-bold uppercase">Status</th>
              <th className="w-28 px-3 py-2 text-xs font-bold uppercase">Date</th>
              <th className="w-28 px-3 py-2 text-xs font-bold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-sm text-black/50">
                  No videos found
                </td>
              </tr>
            ) : (
              videos.map((v) => (
                <tr
                  key={v.id}
                  className={cn(
                    'border-b border-black/10 hover:bg-yellow-50',
                    selectedIds.has(v.id) && 'bg-yellow-100'
                  )}
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer accent-yellow-500"
                      checked={selectedIds.has(v.id)}
                      onChange={(e) => handleSelectOne(v.id, e.target.checked)}
                      aria-label={`Select video ${v.video_id ?? v.video_url}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    {v.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.thumbnail_url} alt="" className="h-10 w-10 border border-black object-cover" />
                    ) : (
                      <div className="h-10 w-10 border border-black bg-gray-200" />
                    )}
                  </td>
                  <td className="max-w-50 truncate px-3 py-2 font-mono text-xs">
                    <a
                      href={displayVideoUrl(v)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-yellow-500"
                    >
                      {v.video_id ?? v.video_url}
                    </a>
                  </td>
                  <td className="px-3 py-2">{v.city}</td>
                  <td className="px-3 py-2">
                    {(() => {
                      const cat = categories.find((c) => c.value === v.category);
                      return cat ? (
                        <span
                          className={cn(
                            'inline-block border border-black px-2 py-0.5 text-xs font-bold uppercase',
                            TAG_VARIANTS[cat.color as TagVariant] ?? 'bg-gray-200 text-black'
                          )}
                        >
                          {cat.name}
                        </span>
                      ) : (
                        <span className="text-xs text-black/40">—</span>
                      );
                    })()}
                  </td>
                  <td className="px-3 py-2">
                    <Select
                      variant="inline"
                      value={v.status}
                      disabled={changingStatus.has(v.id)}
                      className={cn(
                        v.status === 'published'
                          ? 'bg-green-500 text-white'
                          : v.status === 'draft'
                            ? 'bg-gray-400'
                            : v.status === 'rejected'
                              ? 'bg-red-500 text-white'
                              : 'bg-yellow-400'
                      )}
                      onChange={(e) => handleInlineStatusChange(v.id, e.target.value)}
                    >
                      {BULK_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="bg-white text-black">
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-3 py-2 text-xs">{v.video_post_date?.slice(0, 10)}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button onClick={() => setEditVideo(v)} variant="secondary" size="xs">
                        Edit
                      </Button>
                      <Button onClick={() => setDeleteConfirm(v.id)} variant="danger-ghost" size="xs">
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={goToPage} />

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <DeleteConfirmDialog
          label="Video"
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={() => handleDelete(deleteConfirm)}
        />
      )}

      {showAdd && (
        <VideoFormModal
          categories={categories}
          locations={states}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            loadData();
          }}
        />
      )}

      {editVideo && (
        <VideoFormModal
          video={editVideo}
          categories={categories}
          locations={states}
          onClose={() => setEditVideo(null)}
          onSaved={() => {
            setEditVideo(null);
            loadData();
          }}
        />
      )}
    </section>
  );
}
