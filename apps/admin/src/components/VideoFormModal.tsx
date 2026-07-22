'use client';

import { useState, type JSX } from 'react';

import { useToast } from '@/components/Toast';
import type { CategoryRecord, LocationRecord, VideoRecord } from '@/lib/types';

interface VideoFormModalProps {
  video?: VideoRecord | null;
  categories: CategoryRecord[];
  locations: LocationRecord[];
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Modal form for creating or editing a video.
 *
 * @param {VideoFormModalProps} props - Component properties.
 * @param {VideoRecord | null} [props.video] - Existing video to edit, or null for new.
 * @param {CategoryRecord[]} props.categories - Available category options.
 * @param {LocationRecord[]} props.locations - Available location options.
 * @param {() => void} props.onClose - Callback to close the modal.
 * @param {() => void} props.onSaved - Callback after successful save.
 *
 * @returns {JSX.Element} Rendered modal form.
 */
export function VideoFormModal({ video, categories, locations, onClose, onSaved }: VideoFormModalProps): JSX.Element {
  const [igUrl, setIgUrl] = useState(video?.ig_url ?? '');
  const [category, setCategory] = useState(video?.category ?? '');
  const [state, setState] = useState(video?.state ?? '');
  const [city, setCity] = useState(video?.city ?? '');
  const [tags, setTags] = useState<string>(video?.tags?.join(', ') ?? '');
  const [description, setDescription] = useState(video?.description ?? '');
  const [igPostDate, setIgPostDate] = useState(video?.ig_post_date?.slice(0, 10) ?? '');
  const [status, setStatus] = useState<string>(video?.status ?? 'draft');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      ig_url: igUrl,
      category: category || null,
      state: state || null,
      city: city || null,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      description: description || null,
      ig_post_date: igPostDate ? new Date(igPostDate).toISOString() : null,
      status,
    };

    const res = await fetch(video ? `/api/videos/${video.id}` : '/api/videos', {
      method: video ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast(video ? 'Video updated' : 'Video created', 'success');
      onSaved();
    } else {
      toast('Failed to save video', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_#18181b]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-extrabold uppercase">{video ? 'Edit' : 'Add'} Video</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Instagram URL</label>
            <input
              value={igUrl}
              onChange={(e) => setIgUrl(e.target.value)}
              className="w-full border-2 border-black px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border-2 border-black px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full border-2 border-black px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {locations.map((s) => (
                  <option key={s.id} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border-2 border-black px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase">IG Post Date</label>
              <input
                type="date"
                value={igPostDate}
                onChange={(e) => setIgPostDate(e.target.value)}
                className="w-full border-2 border-black px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Tags (comma-separated)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border-2 border-black px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border-2 border-black px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border-2 border-black px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border-2 border-black px-4 py-2 text-sm font-bold uppercase hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="border-2 border-black bg-yellow-400 px-4 py-2 text-sm font-bold uppercase hover:bg-yellow-300"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
