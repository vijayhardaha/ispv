import { put } from '@vercel/blob';

/**
 * Uploads a buffer to Vercel Blob storage.
 *
 * Returns null when no BLOB_READ_WRITE_TOKEN is configured or when the upload
 * fails, so the caller can treat a missing upload as a non-fatal condition.
 * This avoids storing a local path that would violate DB constraints.
 *
 * @param {Buffer} buffer - The image buffer to upload.
 * @param {string} filename - The desired filename for storage.
 *
 * @returns {Promise<string | null>} The public URL, or null if upload is unavailable.
 */
export const uploadBuffer = async (buffer: Buffer, filename: string): Promise<string | null> => {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(filename, buffer, { access: 'public', addRandomSuffix: true, allowOverwrite: true });
      return blob.url;
    } catch (err) {
      console.error('[upload] Vercel Blob upload failed:', err instanceof Error ? err.message : err);
    }
  }

  return null;
};
