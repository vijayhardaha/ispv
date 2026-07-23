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
