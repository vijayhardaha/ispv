'use client';

import { useState, type JSX, type SubmitEvent } from 'react';

import { toast } from 'react-hot-toast';

import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Field, ModalActions, ModalOverlay, ModalTitle } from '@/components/ui/Modal';
import { Radio } from '@/components/ui/Radio';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import type { CategoryRecord } from '@/constants/categories';
import type { LocationRecord } from '@/constants/locations';
import { BULK_STATUS_OPTIONS, STATUS_LABELS } from '@/constants/status';
import { videoFormSchema } from '@/lib/db';
import type { VideoRecord } from '@/lib/db';
import { capitalizeCity, extractIgId, reconstructIgUrl, detectSource } from '@/lib/utils';

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
  const [selectedCategories, setSelectedCategories] = useState<string[]>(video?.categories ?? []);
  const [location, setLocation] = useState(video?.location ?? 'delhi');
  const [city, setCity] = useState(video?.city ?? '');
  const [tags, setTags] = useState<string>(video?.tags?.join(', ') ?? '');
  const [description, setDescription] = useState(video?.description ?? '');
  const [status, setStatus] = useState<string>(video?.status ?? 'draft');
  const [loading, setLoading] = useState(false);

  /**
   * Toggles a category slug in the selected categories list.
   *
   * @param {string} slug - Category slug to toggle.
   */
  const toggleCategory = (slug: string): void => {
    setSelectedCategories((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  };

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
    categories: selectedCategories.length ? selectedCategories : null,
    location: location || null,
    city: city ? capitalizeCity(city) : null,
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
    categories: selectedCategories.length ? selectedCategories : null,
    location: location || null,
    city: city ? capitalizeCity(city) : null,
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
      toast.error(parsed.error.issues[0]?.message ?? 'Invalid form data');
      return false;
    }

    const res = await fetch(video ? `/api/auth/videos/${video.id}` : '/api/auth/videos', {
      method: video ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast.success(video ? 'Video updated' : 'Video created');
      onSaved();
      return true;
    }

    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    toast.error(err.error || 'Failed to save video');
    return false;
  };

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setLoading(true);

    const tagsArr = tags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const body = video ? buildUpdateBody(tagsArr) : buildCreateBody(tagsArr);

    await sendRequest(body);
    setLoading(false);
  };

  return (
    <ModalOverlay onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalTitle editing={!!video}>Video</ModalTitle>
        <div className="space-y-3 p-4">
          <Field label="Instagram URL" htmlFor="video_url">
            <Input
              name="video_url"
              id="video_url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.instagram.com/reel/..."
              required
              disabled={!!video}
            />
          </Field>

          <Field label="Categories" htmlFor={categories[0] ? `category-${categories[0].slug}` : undefined}>
            <div className="flex max-h-44 flex-wrap gap-2 overflow-y-auto rounded-md border border-gray-200 bg-white p-3">
              {categories.map((c) => (
                <Checkbox
                  key={c.slug}
                  name="categories"
                  id={`category-${c.slug}`}
                  label={c.name}
                  labelClassName="text-xs"
                  checked={selectedCategories.includes(c.slug)}
                  onChange={() => toggleCategory(c.slug)}
                />
              ))}
            </div>
          </Field>

          <Field label="Status" htmlFor={BULK_STATUS_OPTIONS[0] ? `status-${BULK_STATUS_OPTIONS[0]}` : undefined}>
            <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-md border border-gray-200 bg-white p-3">
              {BULK_STATUS_OPTIONS.map((s) => (
                <Radio
                  key={s}
                  label={STATUS_LABELS[s]}
                  name="status"
                  id={`status-${s}`}
                  value={s}
                  checked={status === s}
                  onChange={() => setStatus(s)}
                />
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Location" htmlFor="location">
              <Select name="location" id="location" value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">— Select —</option>
                {locations.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="City" htmlFor="city">
              <Input
                name="city"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Delhi, Mumbai, Bangalore"
              />
            </Field>
          </div>

          <Field label="Tags (comma-separated)" htmlFor="tags">
            <Input
              name="tags"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. protest, students, peace"
            />
          </Field>

          <Field label="Description" htmlFor="description">
            <Textarea
              name="description"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the video"
            />
          </Field>
        </div>
        <ModalActions onClose={onClose} loading={loading} />
      </form>
    </ModalOverlay>
  );
}
