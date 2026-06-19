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

  // Helper: redirect unauthenticated users to /sign-in while preserving the
  // originally requested URL in the `next` query param so we can send them
  // back after sign-in.
  const redirectToSignIn = () => {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    // Preserve full path + query of the originally requested URL.
    const originalTarget = pathname + (request.nextUrl.search || '');
    url.search = `?next=${encodeURIComponent(originalTarget)}`;
    return NextResponse.redirect(url);
  };

  // Routes that require a signed-in user. These cover user-driven actions:
  // donating, starting a fundraiser, requesting counselling, posting prayer
  // requests, and sharing testimonies. Browsing the approved fundraiser
  // list, the community pages, public testimonies, and the public prayer
  // wall is left readable on purpose so visitors can see what God is doing
  // before they sign up — the "create" / "give" CTAs themselves are what
  // bounce them through auth.
  const authRequiredPrefixes = [
    '/dashboard',
    '/donate',
    '/fundraisers/new',
    '/testimonies/new',
    '/testimonies/mine',
    '/prayer-wall/new',
    '/prayer-wall/mine',
  ];

  if (!user && authRequiredPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return redirectToSignIn();
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
