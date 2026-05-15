// Standard Supabase SSR middleware pattern (https://supabase.com/docs/guides/auth/server-side/nextjs).
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    },
  );

  // Session refresh is lenient - if it fails, allow the request through
  // rather than blocking all routes due to a network issue.
  let user: { id: string } | null = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Session refresh failed - allow the request through without protection.
    return response;
  }

  const pathname = request.nextUrl.pathname;

  // Protected app routes: /dashboard and everything under (app) group
  // If no user, redirect to sign-in
  if (pathname.startsWith('/dashboard') && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  // Protected testimony routes: /testimonies/new and /testimonies/mine
  // If no user, redirect to sign-in
  if (
    (pathname.startsWith('/testimonies/new') ||
      pathname.startsWith('/testimonies/mine')) &&
    !user
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  // Protected prayer wall routes: /prayer-wall/new and /prayer-wall/mine
  // If no user, redirect to sign-in
  if (
    (pathname.startsWith('/prayer-wall/new') ||
      pathname.startsWith('/prayer-wall/mine')) &&
    !user
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  // Protected admin routes: /admin/*
  // If no user, redirect to sign-in
  // If user but not admin/moderator, redirect to dashboard
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/sign-in';
      return NextResponse.redirect(url);
    }

    // Query the profile role from the profiles table.
    // This check is fail-closed: if the query fails, deny access.
    let role: string | undefined;
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      role = profile?.role?.toLowerCase();
    } catch {
      // Query failed - fail closed by redirecting to dashboard
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // Only moderator and admin roles can access /admin
    if (!role || (role !== 'moderator' && role !== 'admin')) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Auth pages: redirect authenticated users away to dashboard
  const authPages = ['/sign-in', '/sign-up', '/magic-link', '/forgot-password'];
  if (user && authPages.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}
