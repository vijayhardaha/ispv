import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

const mockRedis = { incr: vi.fn(), expire: vi.fn() };

vi.mock('@upstash/redis', () => ({
  Redis: function RedisMock() {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      return mockRedis;
    }
    throw new Error('No Redis configured');
  },
}));

function makeRequest(ip?: string): Request {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (ip) headers['x-real-ip'] = ip;
  return new Request('http://localhost:3001/api/test', { headers, method: 'POST' });
}

describe('checkRateLimit', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    mockRedis.incr.mockReset();
    mockRedis.expire.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('without Redis (in-memory fallback)', () => {
    beforeEach(() => {
      delete process.env.KV_REST_API_URL;
      delete process.env.KV_REST_API_TOKEN;
    });

    it('allows request under limit', async () => {
      const { checkRateLimit } = await import('../rateLimit');
      expect(await checkRateLimit(makeRequest('1.2.3.4'), 'views', 5, 60)).toBe(true);
    });

    it('blocks request over limit', async () => {
      const { checkRateLimit } = await import('../rateLimit');
      const req = makeRequest('10.0.0.1');
      for (let i = 0; i < 5; i++) await checkRateLimit(req, 'rl', 5, 60);
      expect(await checkRateLimit(req, 'rl', 5, 60)).toBe(false);
    });

    it('resets counter after window expiry', async () => {
      const { checkRateLimit } = await import('../rateLimit');
      const req = makeRequest('10.0.0.2');
      for (let i = 0; i < 5; i++) await checkRateLimit(req, 'rl', 5, 1);
      await new Promise((r) => setTimeout(r, 1100));
      expect(await checkRateLimit(req, 'rl', 5, 1)).toBe(true);
    });

    it('tracks different prefixes independently', async () => {
      const { checkRateLimit } = await import('../rateLimit');
      const req = makeRequest('10.0.0.3');
      for (let i = 0; i < 5; i++) await checkRateLimit(req, 'submit', 5, 60);
      expect(await checkRateLimit(req, 'submit', 5, 60)).toBe(false);
      expect(await checkRateLimit(req, 'views', 5, 60)).toBe(true);
    });

    it('tracks different IPs independently', async () => {
      const { checkRateLimit } = await import('../rateLimit');
      for (let i = 0; i < 5; i++) await checkRateLimit(makeRequest('10.0.0.4'), 'rl', 5, 60);
      expect(await checkRateLimit(makeRequest('10.0.0.4'), 'rl', 5, 60)).toBe(false);
      expect(await checkRateLimit(makeRequest('10.0.0.5'), 'rl', 5, 60)).toBe(true);
    });

    it('uses unknown when no IP headers', async () => {
      const { checkRateLimit } = await import('../rateLimit');
      expect(await checkRateLimit(new Request('http://localhost/test', { method: 'POST' }), 'rl', 5, 60)).toBe(true);
    });
  });

  describe('with Redis configured', () => {
    beforeEach(() => {
      process.env.KV_REST_API_URL = 'https://test.upstash.io';
      process.env.KV_REST_API_TOKEN = 'test-token';
    });

    it('allows request under limit', async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);
      const { checkRateLimit } = await import('../rateLimit');
      expect(await checkRateLimit(makeRequest('10.0.0.10'), 'rl', 5, 60)).toBe(true);
      expect(mockRedis.incr).toHaveBeenCalledWith('rl:10.0.0.10');
    });

    it('sets expiry on first request', async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);
      const { checkRateLimit } = await import('../rateLimit');
      await checkRateLimit(makeRequest('10.0.0.11'), 'rl', 5, 60);
      expect(mockRedis.expire).toHaveBeenCalledWith('rl:10.0.0.11', 60);
    });

    it('blocks request over limit', async () => {
      mockRedis.incr.mockResolvedValue(6);
      mockRedis.expire.mockResolvedValue(1);
      const { checkRateLimit } = await import('../rateLimit');
      expect(await checkRateLimit(makeRequest('10.0.0.12'), 'rl', 5, 60)).toBe(false);
    });

    it('falls back to in-memory when Redis throws', async () => {
      mockRedis.incr.mockRejectedValue(new Error('Redis error'));
      const { checkRateLimit } = await import('../rateLimit');
      expect(await checkRateLimit(makeRequest('10.0.0.13'), 'rl', 5, 60)).toBe(true);
    });

    it('extracts IP from x-real-ip', async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);
      const { checkRateLimit } = await import('../rateLimit');
      await checkRateLimit(makeRequest('10.0.0.14'), 'rl', 5, 60);
      expect(mockRedis.incr).toHaveBeenCalledWith('rl:10.0.0.14');
    });

    it('uses x-forwarded-for when x-real-ip absent', async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);
      const { checkRateLimit } = await import('../rateLimit');
      const req = new Request('http://localhost/api/test', {
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.15' },
        method: 'POST',
      });
      await checkRateLimit(req, 'rl', 5, 60);
      expect(mockRedis.incr).toHaveBeenCalledWith('rl:10.0.0.15');
    });
  });
});
