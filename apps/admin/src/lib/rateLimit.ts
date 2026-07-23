import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

// Use Vercel-provided Upstash variables if available
const upstashUrl = process.env.KV_REST_API_URL;
const upstashToken = process.env.KV_REST_API_TOKEN;

if (upstashUrl && upstashToken) {
  try {
    redis = new Redis({ url: upstashUrl, token: upstashToken });
  } catch {
    redis = null;
  }
}

/**
 * Try to use Upstash Redis for atomic rate-limiting.
 * Returns true if the request is allowed, false if rate-limited or Redis not configured.
 *
 * Uses INCR for atomicity: if key does not exist, it is set to 1.
 * Expiry is set only on first call (when value === 1).
 *
 * @param {string} key - Redis key for the rate-limit counter.
 * @param {number} limit - Maximum allowed requests within the window.
 * @param {number} windowSec - Time window in seconds before the counter resets.
 *
 * @returns {Promise<boolean>} True if the request is allowed.
 */
export async function tryUseUpstashRateLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
  if (!redis) return false;
  try {
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
