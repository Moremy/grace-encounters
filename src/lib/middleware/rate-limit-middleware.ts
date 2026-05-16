import { NextResponse } from 'next/server';
import { generalRateLimiter, sensitiveRateLimiter } from '@/lib/security/rate-limit';

/**
 * Extract IP address from request headers.
 * Supports common proxy headers (x-forwarded-for, x-real-ip).
 */
function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Apply general rate limiting to an API route.
 * Returns a NextResponse with 429 status if rate limited, or null if allowed.
 *
 * Usage in an API route:
 * ```ts
 * const rateLimitResponse = applyRateLimit(request);
 * if (rateLimitResponse) return rateLimitResponse;
 * ```
 */
export function applyRateLimit(request: Request): NextResponse | null {
  const ip = getClientIp(request);
  const result = generalRateLimiter.checkRateLimit(ip);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  return null;
}

/**
 * Apply stricter rate limiting for sensitive operations (donations, uploads).
 * Returns a NextResponse with 429 status if rate limited, or null if allowed.
 */
export function applySensitiveRateLimit(request: Request): NextResponse | null {
  const ip = getClientIp(request);
  const result = sensitiveRateLimiter.checkRateLimit(ip);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  return null;
}
