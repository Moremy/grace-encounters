import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Importing `@/lib/env` at the top of the middleware module guarantees the
// zod-validated server schema runs as Next.js boots middleware (the very first
// edge of the request lifecycle). A missing or malformed env file therefore
// fails fast with the loader's labeled error rather than silently producing a
// Supabase client constructed with "undefined".
import '@/lib/env';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// The matcher excludes Next.js internals (_next/static, _next/image), the favicon,
// and common static asset extensions so middleware only runs on app routes.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf)$).*)',
  ],
};
