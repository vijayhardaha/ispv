'use client';

import { useCallback, useEffect, useMemo, useState, type SubmitEvent } from 'react';

import { z } from 'zod/v4';

import type { DbLocation } from '@/lib/db';
import { checkVideoExists, getLocations } from '@/lib/db';
import { countWords, MAX_TAGS, MAX_WORDS, parseTags } from '@/lib/helpers/tags';
import { capitalizeCity, extractInstagramId } from '@/lib/utils';

/** Maximum number of categories that can be selected. */
export const MAX_CATEGORIES = 3;

/**
 * Zod schema validating the public video submission form.
 */
const submitVideoFormSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  location: z.string().min(1, 'Location is required'),
  city: z.string().max(30, 'City must be 30 characters or less'),
  tags: z.string(),
  categories: z.array(z.string()).max(MAX_CATEGORIES, `Select up to ${MAX_CATEGORIES} categories`),
});

/**
 * Inferred type from the submit-video form schema.
 *
 * @type {SubmitVideoForm}
 */
type SubmitVideoForm = z.infer<typeof submitVideoFormSchema>;

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
 * @property {string} tags - Current tags input value (comma-separated).
 * @property {(tags: string) => void} setTags - Sets the tags value.
 * @property {string[]} categories - Selected category slugs (max 3).
 * @property {(slug: string) => void} toggleCategory - Adds or removes a category slug.
 * @property {string | null} error - Current validation error message.
 * @property {(error: string | null) => void} setError - Sets the error message.
 * @property {boolean} success - Whether the submission succeeded.
 * @property {boolean} submitting - Whether a submission is in progress.
 * @property {boolean} checkingUrl - Whether a duplicate URL check is running.
 * @property {boolean} canSubmit - Whether the submit button should be enabled.
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
  tags: string;
  setTags: (tags: string) => void;
  categories: string[];
  toggleCategory: (slug: string) => void;
  error: string | null;
  setError: (error: string | null) => void;
  success: boolean;
  submitting: boolean;
  checkingUrl: boolean;
  canSubmit: boolean;
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
  const [tags, setTags] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
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
    setTags('');
    setCategories([]);
    setError(null);
    setSuccess(false);
    setSubmitting(false);
    setCheckingUrl(false);
  }, []);

  /**
   * Toggles a category slug in the selection, capping at MAX_CATEGORIES.
   * Unchecking is always allowed; adding is blocked once the cap is reached.
   *
   * @param {string} slug - Category slug to add or remove.
   */
  const toggleCategory = useCallback((slug: string) => {
    setCategories((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((s) => s !== slug);
      }
      if (prev.length >= MAX_CATEGORIES) {
        return prev;
      }
      return [...prev, slug];
    });
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
    const result = await checkVideoExists(val);
    if (result.exists) {
      if (result.trashed) {
        setError('This reel was removed from the archive.');
      } else {
        setError('This reel is already in the archive. Submit another one!');
      }
    }
    setCheckingUrl(false);
  }, []);

  const handleBlur = useCallback(() => {
    if (url && !error) {
      checkForDuplicate(url);
    }
  }, [url, error, checkForDuplicate]);

  /**
   * Whether the URL is a valid Instagram reel URL.
   */
  const isValidUrl = useMemo(() => {
    if (!url) {
      return false;
    }
    return extractInstagramId(url) !== null;
  }, [url]);

  /**
   * Whether the tags pass validation.
   */
  const isValidTags = useMemo(() => {
    if (!tags.trim()) {
      return true; // tags are optional
    }
    const parsed = parseTags(tags);
    if (parsed.length > MAX_TAGS) {
      return false;
    }
    if (countWords(parsed) > MAX_WORDS) {
      return false;
    }
    return true;
  }, [tags]);

  /**
   * Whether the submit button should be enabled.
   * Disabled by default — enabled only when URL is valid and tags are valid.
   */
  const canSubmit = useMemo(() => {
    return isValidUrl && isValidTags;
  }, [isValidUrl, isValidTags]);

  const validateForm = useCallback((): string | null => {
    const parsed = submitVideoFormSchema.safeParse({ url, location, city, tags, categories } satisfies SubmitVideoForm);
    if (!parsed.success) {
      return parsed.error.issues[0]?.message ?? 'Invalid form data';
    }

    if (!extractInstagramId(url)) {
      return 'That does not look like a valid Instagram reel URL.';
    }

    const parsedTags = parseTags(tags);
    if (parsedTags.length > MAX_TAGS) {
      return `Maximum ${MAX_TAGS} tags allowed. You have ${parsedTags.length}.`;
    }
    if (countWords(parsedTags) > MAX_WORDS) {
      return `Maximum ${MAX_WORDS} words allowed across all tags. You have ${countWords(parsedTags)}.`;
    }

    return null;
  }, [url, location, city, tags, categories]);

  const submitVideo = useCallback(async () => {
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
    if (!adminUrl) {
      throw new Error('Admin URL is not configured. Set NEXT_PUBLIC_ADMIN_URL in your environment.');
    }

    const cleanTags = parseTags(tags).join(',');
    const response = await fetch(`${adminUrl}/api/public/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, location, city: capitalizeCity(city), tags: cleanTags, categories }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? 'Something went wrong');
    }
  }, [url, location, city, tags, categories]);

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

      const result = await checkVideoExists(url);
      if (result.exists) {
        if (result.trashed) {
          setError('This reel was removed from the archive.');
        } else {
          setError('This reel is already in the archive. Submit another one!');
        }

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
    tags,
    setTags,
    categories,
    toggleCategory,
    error,
    setError,
    success,
    submitting,
    checkingUrl,
    canSubmit,
    locations,
    handleBlur,
    handleSubmit,
    resetForm,
  };
}
