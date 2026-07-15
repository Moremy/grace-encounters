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

  const fetchRole = async (): Promise<string | null> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?select=role&id=eq.${user!.id}`,
        {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          },
        }
      );
      const rows = await res.json() as { role: string }[];
      return rows[0]?.role?.toLowerCase() ?? null;
    } catch {
      return null;
    }
  };

  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/sign-in';
      return NextResponse.redirect(url);
    }
    const role = await fetchRole();
    if (role !== 'moderator' && role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  const authPages = ['/sign-in', '/sign-up', '/magic-link', '/forgot-password'];
  if (user && authPages.includes(pathname)) {
    const role = await fetchRole();
    const url = request.nextUrl.clone();
    url.pathname = role === 'admin' || role === 'moderator' ? '/admin' : '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}
