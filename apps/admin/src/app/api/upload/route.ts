import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

/**
 * Handles file upload to Vercel Blob storage.
 *
 * @param {Request} req - Incoming multipart form data with a file.
 *
 * @returns {Promise<NextResponse>} JSON response with the uploaded blob URL.
 */
export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file') as File;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const blob = await put(file.name, file, { access: 'public' });
  return NextResponse.json({ url: blob.url });
}
