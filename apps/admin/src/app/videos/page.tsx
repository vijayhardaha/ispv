'use client';

import { useState, useEffect, useCallback, Suspense, type JSX } from 'react';

import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { useToast } from '@/components/Toast';
import { Button } from '@/components/ui/Button';
import { VideoFormModal } from '@/components/VideoFormModal';
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

function VideosPageContent(): JSX.Element {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [states, setStates] = useState<LocationRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [editVideo, setEditVideo] = useState<VideoRecord | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  const loadData = useCallback(async () => {
    const [catsRes, stsRes] = await Promise.all([
      supabase.from('categories').select('*').order('value'),
      supabase.from('locations').select('*').order('label'),
    ]);
    if (catsRes.data) setCategories(catsRes.data);
    if (stsRes.data) setStates(stsRes.data);

    const { data } = await supabase.rpc('get_videos_for_api', {
      filters: { status: statusFilter || null, page, per_page: PER_PAGE },
    });
    if (data) {
      setVideos(data);
      if (data.length > 0) setTotalCount(data[0].total_count ?? 0);
    }
  }, [statusFilter, page, supabase]);

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPage <= 1) {
        params.delete('page');
      } else {
        params.set('page', String(newPage));
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams]
  );

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

  const totalPages = Math.min(Math.ceil(totalCount / PER_PAGE), 3);

  return (
    <section className="p-6" aria-labelledby="videos-heading">
      <header className="mb-6 flex items-center justify-between">
        <h1 id="videos-heading" className="text-3xl font-extrabold uppercase">
          Videos
        </h1>
        <Button onClick={() => setShowAdd(true)}>+ Add</Button>
      </header>

      <nav className="mb-4 flex flex-wrap gap-2" aria-label="Status filter">
        {STATUSES.map((s) => (
          <Button
            key={s}
            onClick={() => setStatusFilter(s)}
            variant={statusFilter === s ? 'primary' : 'secondary'}
            size="sm"
          >
            {STATUS_LABELS[s]}
          </Button>
        ))}
      </nav>

      <div className="overflow-x-auto border-2 border-black bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b-2 border-black bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-xs font-bold uppercase">URL</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">City</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Category</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Status</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Date</th>
              <th className="px-3 py-2 text-xs font-bold uppercase">Actions</th>
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
                    {v.ig_url ? (
                      <Image
                        src={v.thumbnail_url}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 border border-black object-cover"
                      />
                    ) : null}
                  </td>
                  <td className="px-3 py-2">{v.city}</td>
                  <td className="px-3 py-2">
                    <span
                      className="inline-block border border-black px-2 py-0.5 text-xs font-bold uppercase"
                      style={{
                        backgroundColor: v.category_color ?? '#ccc',
                        color: v.category_color === 'white' ? '#000' : '#fff',
                      }}
                    >
                      {v.category_label}
                    </span>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button disabled={page <= 1} onClick={() => goToPage(page - 1)} variant="secondary" size="sm">
            Prev
          </Button>
          <span className="text-xs font-bold">
            Page {page} of {totalPages}
          </span>
          <Button disabled={page >= totalPages} onClick={() => goToPage(page + 1)} variant="secondary" size="sm">
            Next
          </Button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="w-full max-w-sm border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#18181b]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-2 text-lg font-extrabold uppercase">Delete Video?</h2>
            <p className="mb-4 text-sm text-black/70">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setDeleteConfirm(null)} variant="secondary">
                Cancel
              </Button>
              <Button onClick={() => handleDelete(deleteConfirm)} variant="danger">
                Delete
              </Button>
            </div>
          </div>
        </div>
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
