'use client';

import { useState, type JSX } from 'react';

import { useToast } from '@/components/Toast';
import { Field, Input, ModalActions, ModalOverlay, ModalTitle, Select, Textarea } from '@/components/ui/Modal';
import { extractIgId, reconstructIgUrl, detectSource } from '@/lib/instagram';
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
  const [igUrl, setIgUrl] = useState(video?.ig_id ? reconstructIgUrl(video.ig_id) : (video?.ig_url ?? ''));
  const [category, setCategory] = useState(video?.category ?? categories[0]?.value ?? '');
  const [state, setState] = useState(video?.state ?? 'delhi');
  const [city, setCity] = useState(video?.city ?? '');
  const [tags, setTags] = useState<string>(video?.tags?.join(', ') ?? '');
  const [description, setDescription] = useState(video?.description ?? '');
  const [status, setStatus] = useState<string>(video?.status ?? 'draft');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ig_id = extractIgId(igUrl) ?? undefined;
    const src = detectSource(igUrl);
    const body = {
      ig_url: igUrl,
      ig_id,
      src,
      category: category || null,
      state: state || null,
      city: city || null,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      description: description || null,
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
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      toast(err.error || 'Failed to save video', 'error');
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalTitle editing={!!video}>Video</ModalTitle>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Instagram URL">
          <Input value={igUrl} onChange={(e) => setIgUrl(e.target.value)} required />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.value}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="State">
            <Select value={state} onChange={(e) => setState(e.target.value)}>
              <option value="">—</option>
              {locations.map((s) => (
                <option key={s.id} value={s.value}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="City">
          <Input value={city} onChange={(e) => setCity(e.target.value)} />
        </Field>

        <Field label="Tags (comma-separated)">
          <Input value={tags} onChange={(e) => setTags(e.target.value)} />
        </Field>

        <Field label="Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>

        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending Review</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </Select>
        </Field>

        <ModalActions onClose={onClose} />
      </form>
    </ModalOverlay>
  );
}
