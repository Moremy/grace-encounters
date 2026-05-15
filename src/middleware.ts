import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // If Supabase environment variables are not configured, skip session
  // management and let the request pass through. This prevents the app from
  // returning 404/500 on every route when running without a Supabase backend.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next();
  }

  return updateSession(request);
}

// The matcher excludes Next.js internals (_next/static, _next/image), the favicon,
// and common static asset extensions so middleware only runs on app routes.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf)$).*)',
  ],
};
