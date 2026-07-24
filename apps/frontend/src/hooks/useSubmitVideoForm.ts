'use client';

import { useCallback, useEffect, useState, type SubmitEvent } from 'react';

import type { DbLocation } from '@/lib/db';
import { checkVideoExists, getLocations } from '@/lib/db';
import { submitVideoFormSchema, type SubmitVideoForm } from '@/lib/frontend-schemas';
import { extractInstagramId } from '@/lib/instagram';

/**
 * Optional configuration for the useSubmitVideoForm hook.
 *
 * @type {UseSubmitVideoFormOptions}
 * @property {(open: boolean) => void} [onOpenChange] - Callback when the dialog open state changes.
 * @property {() => void} [onSuccess] - Callback invoked after a successful video submission.
 */
export interface UseSubmitVideoFormOptions {
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * Return type of the useSubmitVideoForm hook containing form state and handlers.
 *
 * @type {UseSubmitVideoFormReturn}
 * @property {boolean} open - Whether the submission dialog is open.
 * @property {(open: boolean) => void} setOpen - Sets dialog open state.
 * @property {string} url - Current Instagram URL value.
 * @property {(url: string) => void} setUrl - Sets the URL value.
 * @property {string} location - Selected location value.
 * @property {(location: string) => void} setLocation - Sets the location value.
 * @property {string} city - Current city input value.
 * @property {(city: string) => void} setCity - Sets the city value.
 * @property {string} hashtags - Current hashtags input value.
 * @property {(hashtags: string) => void} setHashtags - Sets the hashtags value.
 * @property {string | null} error - Current validation error message.
 * @property {(error: string | null) => void} setError - Sets the error message.
 * @property {boolean} success - Whether the submission succeeded.
 * @property {boolean} submitting - Whether a submission is in progress.
 * @property {boolean} checkingUrl - Whether a duplicate URL check is running.
 * @property {DbLocation[]} locations - Available location options.
 * @property {() => void} handleBlur - URL blur handler for duplicate check.
 * @property {(e: SubmitEvent<HTMLFormElement>) => void} handleSubmit - Form submit handler.
 * @property {() => void} resetForm - Resets all form state to defaults.
 */
export interface UseSubmitVideoFormReturn {
  open: boolean;
  setOpen: (open: boolean) => void;
  url: string;
  setUrl: (url: string) => void;
  location: string;
  setLocation: (location: string) => void;
  city: string;
  setCity: (city: string) => void;
  hashtags: string;
  setHashtags: (hashtags: string) => void;
  error: string | null;
  setError: (error: string | null) => void;
  success: boolean;
  submitting: boolean;
  checkingUrl: boolean;
  locations: DbLocation[];
  handleBlur: () => void;
  handleSubmit: (e: SubmitEvent<HTMLFormElement>) => void;
  resetForm: () => void;
}

/**
 * Manages video submission form state, validation, and API interaction.
 *
 * @param {UseSubmitVideoFormOptions} [options] - Optional callbacks.
 * @param {(open: boolean) => void} [options.onOpenChange] - Callback when dialog opens or closes.
 * @param {() => void} [options.onSuccess] - Callback after a successful submission.
 *
 * @returns {UseSubmitVideoFormReturn} Form state and action handlers.
 */
export function useSubmitVideoForm({
  onOpenChange,
  onSuccess,
}: UseSubmitVideoFormOptions = {}): UseSubmitVideoFormReturn {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [location, setLocation] = useState('Delhi');
  const [city, setCity] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkingUrl, setCheckingUrl] = useState(false);
  const [locations, setLocations] = useState<DbLocation[]>([]);

  useEffect(() => {
    getLocations()
      .then(setLocations)
      .catch(() => {});
  }, []);

  const resetForm = useCallback(() => {
    setUrl('');
    setLocation('Delhi');
    setCity('');
    setHashtags('');
    setError(null);
    setSuccess(false);
    setSubmitting(false);
    setCheckingUrl(false);
  }, []);

  const handleOpen = useCallback(
    (next: boolean) => {
      if (!next) {
        setTimeout(resetForm, 200);
      }
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange, resetForm]
  );

  const checkForDuplicate = useCallback(async (val: string) => {
    const igId = extractInstagramId(val);
    if (!igId) {
      return;
    }

    setCheckingUrl(true);
    const exists = await checkVideoExists(val);
    if (exists) {
      setError('This reel is already in the archive. Submit another one!');
    }
    setCheckingUrl(false);
  }, []);

  const handleBlur = useCallback(() => {
    if (url && !error) {
      checkForDuplicate(url);
    }
  }, [url, error, checkForDuplicate]);

  const validateForm = useCallback((): string | null => {
    const parsed = submitVideoFormSchema.safeParse({ url, location, city, hashtags } satisfies SubmitVideoForm);
    if (!parsed.success) {
      return parsed.error.issues[0]?.message ?? 'Invalid form data';
    }
    if (!extractInstagramId(url)) {
      return 'That does not look like a valid Instagram reel URL.';
    }
    return null;
  }, [url, location, city, hashtags]);

  const submitVideo = useCallback(async () => {
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
    if (!adminUrl) {
      throw new Error('Admin URL is not configured. Set NEXT_PUBLIC_ADMIN_URL in your environment.');
    }
    const cleanTags = hashtags
      .split(/\s+/)
      .map((h) => h.trim())
      .filter((h) => h.startsWith('#'))
      .map((h) => h.replace(/^#+/, ''))
      .join(',');
    const response = await fetch(`${adminUrl}/api/public/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, location, city, hashtags: cleanTags }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? 'Something went wrong');
    }
  }, [url, location, city, hashtags]);

  const handleSubmit = useCallback(
    async (e: SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);

      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }

      setSubmitting(true);

      const exists = await checkVideoExists(url);
      if (exists) {
        setError('This reel is already in the archive. Submit another one!');
        setSubmitting(false);
        return;
      }

      try {
        await submitVideo();
        setSuccess(true);
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setSubmitting(false);
      }
    },
    [url, validateForm, submitVideo, onSuccess]
  );

  return {
    open,
    setOpen: handleOpen,
    url,
    setUrl,
    location,
    setLocation,
    city,
    setCity,
    hashtags,
    setHashtags,
    error,
    setError,
    success,
    submitting,
    checkingUrl,
    locations,
    handleBlur,
    handleSubmit,
    resetForm,
  };
}
