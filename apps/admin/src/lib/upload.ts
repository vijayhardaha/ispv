import { del, put } from '@vercel/blob';

/** Whether we've already logged the missing-token warning once. */
let missingTokenWarningLogged = false;

/**
 * Uploads a buffer to Vercel Blob storage.
 *
 * Uses deterministic filenames (no random suffix) so re-enriching the same
 * video overwrites the existing blob.  Returns null when no
 * BLOB_READ_WRITE_TOKEN is configured or when the upload fails, so the
 * caller can treat a missing upload as a non-fatal condition.
 *
 * @param {Buffer} buffer - The image buffer to upload.
 * @param {string} filename - The desired filename for storage.
 *
 * @returns {Promise<string | null>} The public URL, or null if upload is unavailable.
 */
export const uploadBuffer = async (buffer: Buffer, filename: string): Promise<string | null> => {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      // Wrap in Blob to avoid SharedArrayBuffer issue from sharp's internal buffer
      const blob = await put(filename, new Blob([new Uint8Array(buffer)]), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return blob.url;
    } catch (err) {
      console.error('[upload] Vercel Blob upload failed:', err instanceof Error ? err.message : err);
    }
  } else if (!missingTokenWarningLogged) {
    missingTokenWarningLogged = true;
    console.warn(
      '[upload] BLOB_READ_WRITE_TOKEN is not set. '
        + 'Thumbnail uploads to Vercel Blob are disabled. '
        + 'Add BLOB_READ_WRITE_TOKEN to your Vercel project environment variables '
        + 'or local .env.local to enable thumbnail storage.'
    );
  }

  return null;
};

/**
 * Deletes a blob from Vercel Blob storage by its public URL.
 *
 * Only attempts deletion when the URL belongs to a Vercel Blob store.
 * Silently skips null, empty, or non-blob URLs so callers don't need
 * to guard every call.
 *
 * @param {string | null | undefined} url - The public blob URL to delete.
 *
 * @returns {Promise<void>}
 */
export const deleteBlob = async (url: string | null | undefined): Promise<void> => {
  if (!url || !url.includes('blob.vercel-storage.com')) {
    return;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn('[upload] Cannot delete blob — BLOB_READ_WRITE_TOKEN is not set.');
    return;
  }

  try {
    await del(url);
    console.log('[upload] Deleted blob:', url);
  } catch (err) {
    console.error('[upload] Failed to delete blob:', url, '-', err instanceof Error ? err.message : err);
  }
};
