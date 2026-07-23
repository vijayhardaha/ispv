'use client';

import { useState, useEffect, useCallback, Suspense, type JSX } from 'react';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { useToast } from '@/components/Toast';
import { Button } from '@/components/ui/Button';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { VideoFormModal } from '@/components/VideoFormModal';
import { TAG_VARIANTS, type TagVariant } from '@/constants/colors';
import { usePagination } from '@/hooks/usePagination';
import { cn } from '@/lib/cn';
import { displayVideoUrl } from '@/lib/instagram';
import { createClient } from '@/lib/supabase';
import type { CategoryRecord, LocationRecord, VideoRecord } from '@/lib/types';

const STATUSES = ['', 'draft', 'pending_review', 'published', 'rejected'] as const;
const STATUS_LABELS: Record<string, string> = {
  '': 'All',
  draft: 'Draft',
  pending_review: 'Pending',
  published: 'Published',
  rejected: 'Rejected',
};
const PER_PAGE = 15;

/**
 * Videos management page with filtering, pagination, and CRUD operations.
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
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [states, setStates] = useState<LocationRecord[]>([]);
  const [editVideo, setEditVideo] = useState<VideoRecord | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
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
    const [catsRes, stsRes] = await Promise.all([
      supabase.from('categories').select('*').order('value'),
      supabase.from('locations').select('*').order('name'),
    ]);
    if (catsRes.data) setCategories(catsRes.data);
    if (stsRes.data) setStates(stsRes.data);

    const { data } = await supabase.rpc('get_videos_for_api', {
      filters: { status: status || null, search: search || null, page, per_page: PER_PAGE },
    });
    if (data) {
      setVideos(data);
      if (data.length > 0) setTotalCount(data[0].total_count ?? 0);
    }
  }, [status, search, page, supabase]);

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast('Video deleted', 'success');
      setDeleteConfirm(null);
      loadData();
    } else {
      toast('Failed to delete video', 'error');
    }
  };

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
        <nav className="flex flex-wrap gap-2" aria-label="Status filter">
          {STATUSES.map((s) => (
            <Button key={s} onClick={() => setStatus(s)} variant={status === s ? 'primary' : 'secondary'} size="sm">
              {STATUS_LABELS[s]}
            </Button>
          ))}
        </nav>
      </div>

      <div className="overflow-x-auto border-2 border-black bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b-2 border-black bg-gray-100">
            <tr>
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
                <td colSpan={7} className="px-3 py-8 text-center text-sm text-black/50">
                  No videos found
                </td>
              </tr>
            ) : (
              videos.map((v) => (
                <tr key={v.id} className="border-b border-black/10 hover:bg-yellow-50">
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
                      {v.ig_id ?? v.ig_url}
                    </a>
                  </td>
                  <td className="px-3 py-2">{v.city}</td>
                  <td className="px-3 py-2">
                    {v.category ? (
                      <span
                        className={cn(
                          'inline-block border border-black px-2 py-0.5 text-xs font-bold uppercase',
                          TAG_VARIANTS[v.category_color as TagVariant] ?? 'bg-gray-200 text-black'
                        )}
                      >
                        {v.category_name}
                      </span>
                    ) : (
                      <span className="text-xs text-black/40">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block border border-black px-2 py-0.5 text-xs font-bold uppercase ${
                        v.status === 'published'
                          ? 'bg-green-500 text-white'
                          : v.status === 'draft'
                            ? 'bg-gray-400'
                            : v.status === 'rejected'
                              ? 'bg-red-500 text-white'
                              : 'bg-yellow-400'
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">{v.ig_post_date?.slice(0, 10)}</td>
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
