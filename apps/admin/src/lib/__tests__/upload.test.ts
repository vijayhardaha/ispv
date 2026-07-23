import { rm } from 'node:fs/promises';
import { join } from 'node:path';

import { put } from '@vercel/blob';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { uploadBuffer } from '../upload';

vi.mock('@vercel/blob', () => ({ put: vi.fn() }));

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

    expect(put).toHaveBeenCalledWith('test.jpg', expect.any(Blob), { access: 'public' });
    expect(url).toBe('https://blob.vercel.com/test.jpg');
  });

  it('falls back to local filesystem when put throws an error', async () => {
    process.env.BLOB_READ_WRITE_TOKEN = 'test_token';
    vi.mocked(put).mockRejectedValueOnce(new Error('Vercel blob error'));

    const buffer = Buffer.from('test data');
    const url = await uploadBuffer(buffer, 'sample.png');

    expect(url).toMatch(/^\/uploads\/\d+-sample\.png$/);

    // Clean up created local file
    const createdFile = join(process.cwd(), 'public', url);
    await rm(createdFile, { force: true });
  });

  it('saves to local filesystem when BLOB_READ_WRITE_TOKEN is not set', async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;

    const buffer = Buffer.from('local file data');
    const url = await uploadBuffer(buffer, 'local-sample.jpg');

    expect(url).toMatch(/^\/uploads\/\d+-local-sample\.jpg$/);

    // Clean up created local file
    const createdFile = join(process.cwd(), 'public', url);
    await rm(createdFile, { force: true });
  });
});
