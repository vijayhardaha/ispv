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
 * Shared in-memory store for per-instance rate-limit fallback.
 * On Vercel serverless, each cold start gets its own store.
 * The prefix in the key differentiates different rate limiters (submit vs views).
 */
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Extracts the client IP from forwarded headers.
 *
 * Prefers `x-real-ip` (set by edge/CDN) over `x-forwarded-for` (can be spoofed).
 *
 * @param {Request} req - Incoming request.
 *
 * @returns {string} IP address string.
 */
const getIpKey = (req: Request): string => {
  const ip = req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for') || 'unknown';
  return ip.split(',')[0].trim();
};

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
const tryUseUpstashRateLimit = async (key: string, limit: number, windowSec: number): Promise<boolean> => {
  if (!redis) {
    return false;
  }
  try {
    const value = await redis.incr(key);
    if (value === 1) {
      await redis.expire(key, windowSec);
    }
    return value <= limit;
  } catch {
    // On any error, fall back to in-memory limiter
    return false;
  }
};

/**
 * Checks whether a request is within the in-memory rate limit.
 *
 * @param {string} key - Rate-limit key (IP-based with prefix).
 * @param {number} limit - Maximum allowed requests within the window.
 * @param {number} windowSec - Time window in seconds.
 *
 * @returns {boolean} True if the request is allowed.
 */
const checkInMemoryLimit = (key: string, limit: number, windowSec: number): boolean => {
  const now = Date.now();
  const entry = inMemoryStore.get(key);
  if (!entry || entry.resetAt <= now) {
    inMemoryStore.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return true;
  }
  if (entry.count >= limit) {
    return false;
  }
  entry.count += 1;
  return true;
};

/**
 * Checks rate limit using Upstash Redis with in-memory fallback.
 *
 * @param {Request} req - Incoming request for IP extraction.
 * @param {string} prefix - Key prefix to differentiate rate limiters (e.g. 'rl', 'views').
 * @param {number} limit - Maximum allowed requests within the window.
 * @param {number} windowSec - Time window in seconds.
 *
 * @returns {Promise<boolean>} True if the request is allowed.
 */
export const checkRateLimit = async (
  req: Request,
  prefix: string,
  limit: number,
  windowSec: number
): Promise<boolean> => {
  const ip = getIpKey(req);
  const key = `${prefix}:${ip}`;

  const upstashAllowed = await tryUseUpstashRateLimit(key, limit, windowSec);
  if (upstashAllowed) {
    return true;
  }

  return checkInMemoryLimit(key, limit, windowSec);
};
