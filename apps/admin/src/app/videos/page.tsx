'use client';

import { useState, useEffect, useCallback, type JSX } from 'react';

import Image from 'next/image';

import { useToast } from '@/components/Toast';
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
const PER_PAGE = 20;

/**
 * Videos management page with filtering, pagination, and CRUD operations.
 *
 * @returns {JSX.Element} Rendered videos page.
 */
export default function VideosPage(): JSX.Element {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [states, setStates] = useState<LocationRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [editVideo, setEditVideo] = useState<VideoRecord | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    const [catsRes, stsRes] = await Promise.all([
      supabase.from('categories').select('*').order('slug'),
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
    const timer = setTimeout(() => setPage(1), 0);
    return () => clearTimeout(timer);
  }, [statusFilter]);

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
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold uppercase">Videos</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="border-2 border-black bg-yellow-400 px-4 py-2 text-sm font-bold uppercase hover:bg-yellow-300"
        >
          + Add
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`border-2 border-black px-3 py-1 text-xs font-bold uppercase ${statusFilter === s ? 'bg-yellow-400' : 'bg-white hover:bg-gray-100'}`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto border-2 border-black bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b-2 border-black bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-xs font-bold uppercase">Thumb</th>
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
                    {v.thumbnail_url ? (
                      <Image
                        src={v.thumbnail_url}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 border border-black object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 border border-black bg-gray-200" />
                    )}
                  </td>
                  <td className="max-w-[200px] truncate px-3 py-2 font-mono text-xs">{v.ig_url}</td>
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
                      <button
                        onClick={() => setEditVideo(v)}
                        className="border border-black px-2 py-1 text-xs font-bold uppercase hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(v.id)}
                        className="border border-black bg-red-50 px-2 py-1 text-xs font-bold text-red-600 uppercase hover:bg-red-100"
                      >
                        Delete
                      </button>
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
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="border-2 border-black bg-white px-3 py-1 text-xs font-bold uppercase hover:bg-gray-100 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-xs font-bold">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="border-2 border-black bg-white px-3 py-1 text-xs font-bold uppercase hover:bg-gray-100 disabled:opacity-40"
          >
            Next
          </button>
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
              <button
                onClick={() => setDeleteConfirm(null)}
                className="border-2 border-black px-4 py-2 text-sm font-bold uppercase hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="border-2 border-black bg-red-500 px-4 py-2 text-sm font-bold text-white uppercase hover:bg-red-600"
              >
                Delete
              </button>
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
    </div>
  );
}
