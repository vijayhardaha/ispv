'use client';

import { useEffect, useState, type FormEvent } from 'react';

import type { DbLocation } from '@/lib/db';
import { checkVideoExists, getLocations } from '@/lib/db';
import { extractInstagramId } from '@/lib/instagram';
import { submitVideoFormSchema, type SubmitVideoForm } from '@/lib/schemas';

export interface UseSubmitVideoFormOptions {
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

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
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  resetForm: () => void;
}

/**
 *
 * @param props
 * @param props.onOpenChange
 * @param props.onSuccess
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

  const resetForm = () => {
    setUrl('');
    setLocation('Delhi');
    setCity('');
    setHashtags('');
    setError(null);
    setSuccess(false);
    setSubmitting(false);
    setCheckingUrl(false);
  };

  const handleOpen = (next: boolean) => {
    if (!next) setTimeout(resetForm, 200);
    setOpen(next);
    onOpenChange?.(next);
  };

  const checkForDuplicate = async (val: string) => {
    const igId = extractInstagramId(val);
    if (!igId) return;

    setCheckingUrl(true);
    const exists = await checkVideoExists(val);
    if (exists) {
      setError('This reel is already in the archive. Submit another one!');
    }
    setCheckingUrl(false);
  };

  const handleBlur = () => {
    if (url && !error) {
      checkForDuplicate(url);
    }
  };

  const validateForm = (): string | null => {
    const parsed = submitVideoFormSchema.safeParse({ url, location, city, hashtags } satisfies SubmitVideoForm);
    if (!parsed.success) {
      return parsed.error.issues[0]?.message ?? 'Invalid form data';
    }
    if (!extractInstagramId(url)) {
      return 'That does not look like a valid Instagram reel URL.';
    }
    return null;
  };

  const submitVideo = async () => {
    const response = await fetch('/api/submit-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, location, city, hashtags }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? 'Something went wrong');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
  };

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
