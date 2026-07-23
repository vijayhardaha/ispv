import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
  } catch {
    redis = null;
  }
}

/**
 * Try to use Upstash Redis for atomic rate-limiting.
 * Returns true if the request is allowed, false if rate-limited or Redis not configured.
 */
export async function tryUseUpstashRateLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
  if (!redis) return false;
  try {
    // INCR the key and set expiry when first seen
    const value = await redis.incr(key);
    if (value === 1) {
      await redis.expire(key, windowSec);
    }
    return value <= limit;
  } catch (e) {
    // On any error, fall back to in-memory limiter
    return false;
  }
}
