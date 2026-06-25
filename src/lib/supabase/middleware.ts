import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const redirectToSignIn = () => {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    const originalTarget = pathname + (request.nextUrl.search || '');
    url.search = `?next=${encodeURIComponent(originalTarget)}`;
    return NextResponse.redirect(url);
  };

  const authRequiredPrefixes = [
    '/dashboard',
    '/donate',
    '/fundraisers/new',
    '/giving',
    '/messages',
    '/notifications',
    '/profile',
    '/settings',
    '/testimonies/new',
    '/testimonies/mine',
    '/prayer-wall/mine',
  ];

  if (!user && authRequiredPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return redirectToSignIn();
  }

  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/sign-in';
      return NextResponse.redirect(url);
    }
  }

  const authPages = ['/sign-in', '/sign-up', '/magic-link', '/forgot-password'];
  if (user && authPages.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}
