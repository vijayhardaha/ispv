'use client';

import { useState, type JSX, type SubmitEvent } from 'react';

import { useToast } from '@/components/Toast';
import { Field, Input, ModalActions, ModalOverlay, ModalTitle, Textarea } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import type { CategoryRecord } from '@/constants/categories';
import type { LocationRecord } from '@/constants/locations';
import { extractIgId, reconstructIgUrl, detectSource } from '@/lib/instagram';
import { videoFormSchema } from '@/lib/schemas';
import type { VideoRecord } from '@/lib/types';

/**
 * Properties for the VideoFormModal component.
 *
 * @type {VideoFormModalProps}
 * @property {VideoRecord | null} [video] - Existing video to edit, or null for new.
 * @property {CategoryRecord[]} categories - Available category options.
 * @property {LocationRecord[]} locations - Available location options.
 * @property {() => void} onClose - Callback to close the modal.
 * @property {() => void} onSaved - Callback after successful save.
 */
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
  const [videoUrl, setVideoUrl] = useState(
    video?.video_id ? reconstructIgUrl(video.video_id) : (video?.video_url ?? '')
  );
  const [category, setCategory] = useState(video?.category ?? '');
  const [location, setLocation] = useState(video?.location ?? 'delhi');
  const [city, setCity] = useState(video?.city ?? '');
  const [tags, setTags] = useState<string>(video?.tags?.join(', ') ?? '');
  const [description, setDescription] = useState(video?.description ?? '');
  const [status, setStatus] = useState<string>(video?.status ?? 'draft');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Builds the request body for creating a new video.
   *
   * @param {string[]} tagsArr - Parsed tags array.
   *
   * @returns {Record<string, unknown>} Body for the creation request.
   */
  const buildCreateBody = (tagsArr: string[]): Record<string, unknown> => ({
    video_url: videoUrl,
    video_id: extractIgId(videoUrl) ?? undefined,
    video_src: detectSource(videoUrl),
    category: category || null,
    location: location || null,
    city: city || null,
    tags: tagsArr,
    description: description || null,
    status,
  });

  /**
   * Builds the request body for updating an existing video (URL is kept intact).
   *
   * @param {string[]} tagsArr - Parsed tags array.
   *
   * @returns {Record<string, unknown>} Body for the update request.
   */
  const buildUpdateBody = (tagsArr: string[]): Record<string, unknown> => ({
    category: category || null,
    location: location || null,
    city: city || null,
    tags: tagsArr,
    description: description || null,
    status,
  });

  /**
   * Sends the form data to the API.
   *
   * @param {Record<string, unknown>} body - Request body.
   *
   * @returns {Promise<boolean>} True if the request succeeded.
   */
  const sendRequest = async (body: Record<string, unknown>): Promise<boolean> => {
    const parsed = videoFormSchema.safeParse(body);
    if (!parsed.success) {
      toast(parsed.error.issues[0]?.message ?? 'Invalid form data', 'error');
      return false;
    }

    const res = await fetch(video ? `/api/auth/videos/${video.id}` : '/api/auth/videos', {
      method: video ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast(video ? 'Video updated' : 'Video created', 'success');
      onSaved();
      return true;
    }

    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    toast(err.error || 'Failed to save video', 'error');
    return false;
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setLoading(true);

    const tagsArr = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const body = video ? buildUpdateBody(tagsArr) : buildCreateBody(tagsArr);

    await sendRequest(body);
    setLoading(false);
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalTitle editing={!!video}>Video</ModalTitle>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Instagram URL">
          <Input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.instagram.com/reel/..."
            required
            disabled={!!video}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">— Select —</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Location">
            <Select value={location} onChange={(e) => setLocation(e.target.value)}>
              <option value="">—</option>
              {locations.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="City">
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Delhi, Mumbai, Bangalore" />
        </Field>

        <Field label="Tags (comma-separated)">
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. protest, students, peace" />
        </Field>

        <Field label="Description">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the video"
          />
        </Field>

        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="pending_review">Pending Review</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
          </Select>
        </Field>

        <ModalActions onClose={onClose} loading={loading} />
      </form>
    </ModalOverlay>
  );
}
