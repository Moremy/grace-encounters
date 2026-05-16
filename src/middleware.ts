import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { defaultLocale, LOCALE_COOKIE, isValidLocale, type Locale } from '@/lib/i18n/config';

/**
 * Detects the preferred locale from the request.
 * Priority: cookie > Accept-Language header > default locale.
 */
function detectLocale(request: NextRequest): Locale {
  // 1. Check cookie
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Parse Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferred = acceptLanguage
      .split(',')
      .map((part) => {
        const [lang, q] = part.trim().split(';q=');
        return { lang: lang.trim().split('-')[0].toLowerCase(), q: q ? parseFloat(q) : 1 };
      })
      .sort((a, b) => b.q - a.q);

    for (const { lang } of preferred) {
      if (isValidLocale(lang)) {
        return lang;
      }
    }
  }

  return defaultLocale;
}

export async function middleware(request: NextRequest) {
  // Detect and set locale cookie if not present
  const locale = detectLocale(request);
  const hasLocaleCookie = request.cookies.has(LOCALE_COOKIE);

  // If Supabase environment variables are not configured, skip session
  // management and let the request pass through. This prevents the app from
  // returning 404/500 on every route when running without a Supabase backend.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const response = NextResponse.next();
    if (!hasLocaleCookie) {
      response.cookies.set(LOCALE_COOKIE, locale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      });
    }
    return response;
  }

  const response = await updateSession(request);

  // Set locale cookie if not already present
  if (!hasLocaleCookie && response) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  return response;
}

// The matcher excludes Next.js internals (_next/static, _next/image), the favicon,
// and common static asset extensions so middleware only runs on app routes.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf)$).*)',
  ],
};
