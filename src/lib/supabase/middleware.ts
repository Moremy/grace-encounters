// Standard Supabase SSR middleware pattern (https://supabase.com/docs/guides/auth/server-side/nextjs).
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  try {
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

    // Refresh session
    const { data: { user } } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Protected app routes: /dashboard and everything under (app) group
    // If no user, redirect to sign-in
    if (pathname.startsWith('/dashboard') && !user) {
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

      // Query the profile role from the profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role?.toLowerCase() as 'user' | 'moderator' | 'admin' | undefined;

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
  } catch {
    // If session refresh or protection logic fails (e.g. network issue, invalid config),
    // allow the request through rather than blocking all routes.
  }

  return response;
}
