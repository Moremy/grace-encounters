/**
 * Security headers configuration for Next.js.
 * These are merged into the next.config.mjs headers() function.
 *
 * In development, script-src and connect-src are relaxed to allow
 * Next.js dev runtime (React Refresh, HMR, webpack eval).
 */

const isDev = process.env.NODE_ENV !== 'production';

export const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co https://res.cloudinary.com",
      "font-src 'self' data:",
      isDev
        ? "connect-src 'self' https://*.supabase.co wss://*.supabase.co http://localhost:* ws://localhost:*"
        : "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "media-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
    ].join('; '),
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
];
