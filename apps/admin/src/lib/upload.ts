import { writeFile, mkdir } from 'node:fs/promises';
import { basename, join } from 'node:path';

import { put } from '@vercel/blob';

/**
 * Uploads a buffer to Vercel Blob storage, falling back to local filesystem.
 *
 * @param {Buffer} buffer - The image buffer to upload.
 * @param {string} filename - The desired filename for storage.
 *
 * @returns {Promise<string>} The public URL or local path to the uploaded file.
 */
export async function uploadBuffer(buffer: Buffer, filename: string): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(filename, new Blob([buffer.buffer as ArrayBuffer]), { access: 'public' });
      return blob.url;
    } catch {
      // fall through to local
    }
  }

  const name = `${Date.now()}-${basename(filename)}`;
  const dir = join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, name), buffer);
  return `/uploads/${name}`;
}
