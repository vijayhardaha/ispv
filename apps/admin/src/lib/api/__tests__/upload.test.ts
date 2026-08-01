import { del, put } from '@vercel/blob';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { deleteBlob, sanitizeFilename, uploadBuffer } from '../upload';

vi.mock('@vercel/blob', () => ({ put: vi.fn(), del: vi.fn() }));

describe('sanitizeFilename', () => {
  it('keeps alphanumeric characters, hyphens, underscores, and dots', () => {
    expect(sanitizeFilename('instagram-ABC123_v2.jpg')).toBe('instagram-ABC123_v2.jpg');
  });

  it('strips spaces and special characters', () => {
    expect(sanitizeFilename('my file!@#.jpg')).toBe('myfile.jpg');
  });

  it('returns empty string for input with no allowed characters', () => {
    expect(sanitizeFilename('!!! ')).toBe('');
  });

  it('keeps dots in filenames with extensions', () => {
    expect(sanitizeFilename('thumb.123.png')).toBe('thumb.123.png');
  });
});

describe('uploadBuffer', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('uploads to Vercel Blob when BLOB_READ_WRITE_TOKEN is set', async () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'test_token';
    vi.mocked(put).mockResolvedValueOnce({ url: 'https://blob.vercel.com/test.jpg' } as any);

    const buffer = Buffer.from('test');
    const url = await uploadBuffer(buffer, 'test.jpg');

    expect(put).toHaveBeenCalledWith('test.jpg', expect.any(Blob), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    expect(url).toBe('https://blob.vercel.com/test.jpg');
  });

  it('returns null when put throws an error', async () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'test_token';
    vi.mocked(put).mockRejectedValueOnce(new Error('Vercel blob error'));

    const buffer = Buffer.from('test data');
    const url = await uploadBuffer(buffer, 'sample.png');

    expect(url).toBeNull();
  });

  it('returns null when BLOB_READ_WRITE_TOKEN is not set', async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;

    const buffer = Buffer.from('local file data');
    const url = await uploadBuffer(buffer, 'local-sample.jpg');

    expect(url).toBeNull();
  });
});

describe('deleteBlob', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('skips silently for null or empty URLs', async () => {
    await deleteBlob(null);
    await deleteBlob('');
    await deleteBlob(undefined);
    expect(del).not.toHaveBeenCalled();
  });

  it('skips non-Vercel blob URLs', async () => {
    await deleteBlob('https://example.com/image.jpg');
    expect(del).not.toHaveBeenCalled();
  });

  it('deletes the blob when a token is configured', async () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'test_token';
    vi.mocked(del).mockResolvedValueOnce();

    await deleteBlob('https://blob.vercel-storage.com/image.jpg');

    expect(del).toHaveBeenCalledWith('https://blob.vercel-storage.com/image.jpg');
  });

  it('warns and skips when the token is missing', async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await deleteBlob('https://blob.vercel-storage.com/image.jpg');

    expect(del).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
