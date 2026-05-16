/**
 * In-memory sliding window rate limiter.
 *
 * Uses a Map with TTL-based cleanup. Suitable for single-instance deployments.
 * For multi-instance deployments, replace with Redis-backed implementation.
 */

interface RateLimitOptions {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
}

interface RateLimitEntry {
  timestamps: number[];
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests } = options;
  const store = new Map<string, RateLimitEntry>();

  // Periodic cleanup of expired entries (every 60 seconds)
  let cleanupInterval: ReturnType<typeof setInterval> | null = null;

  function startCleanup() {
    if (cleanupInterval) return;
    cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of store.entries()) {
        const validTimestamps = entry.timestamps.filter(
          (ts) => now - ts < windowMs,
        );
        if (validTimestamps.length === 0) {
          store.delete(key);
        } else {
          entry.timestamps = validTimestamps;
        }
      }
    }, 60_000);
    // Allow Node.js to exit even if the interval is still running
    if (cleanupInterval && typeof cleanupInterval === 'object' && 'unref' in cleanupInterval) {
      cleanupInterval.unref();
    }
  }

  startCleanup();

  /**
   * Check if the identifier has exceeded the rate limit.
   * Returns success: true if the request is allowed, false if rate limited.
   */
  function checkRateLimit(identifier: string): RateLimitResult {
    const now = Date.now();
    const entry = store.get(identifier);

    if (!entry) {
      store.set(identifier, { timestamps: [now] });
      return {
        success: true,
        remaining: maxRequests - 1,
        resetAt: now + windowMs,
      };
    }

    // Filter to only timestamps within the current window (sliding window)
    const validTimestamps = entry.timestamps.filter(
      (ts) => now - ts < windowMs,
    );

    if (validTimestamps.length >= maxRequests) {
      const oldestInWindow = validTimestamps[0]!;
      return {
        success: false,
        remaining: 0,
        resetAt: oldestInWindow + windowMs,
      };
    }

    validTimestamps.push(now);
    entry.timestamps = validTimestamps;

    return {
      success: true,
      remaining: maxRequests - validTimestamps.length,
      resetAt: validTimestamps[0]! + windowMs,
    };
  }

  return { checkRateLimit };
}

/** General API route rate limiter: 100 requests per minute per IP */
export const generalRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 100,
});

/** Auth route rate limiter: 10 requests per minute per IP */
export const authRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 10,
});

/** Stricter rate limiter for sensitive operations: 20 per minute */
export const sensitiveRateLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 20,
});
