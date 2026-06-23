// Middleware auth for Next.js 14 Edge Runtime. Uses fetch() to call Supabase
// APIs directly so that @supabase/supabase-js (which references process.version
// at module scope) is never imported into the Edge Runtime bundle.
import { NextResponse, type NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getUrl(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
}

function getKey(): string | null {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null;
}

/**
 * Extracts access + refresh tokens from the Supabase auth cookie.
 * The cookie name is `sb-{projectRef}-auth-token`; we match by the suffix.
 */
function parseAuthCookie(request: NextRequest): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  const all = request.cookies.getAll();
  const cookie = all.find((c) => c.name.endsWith('-auth-token'));
  if (!cookie) return { accessToken: null, refreshToken: null };

  try {
    const parsed = JSON.parse(cookie.value);
    if (!Array.isArray(parsed) || parsed.length < 2) {
      return { accessToken: null, refreshToken: null };
    }
    return {
      accessToken: typeof parsed[0] === 'string' ? parsed[0] : null,
      refreshToken: typeof parsed[1] === 'string' ? parsed[1] : null,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

/**
 * Calls Supabase Auth API to get the current user.
 * Returns the user ID, or null if the token is invalid/expired.
 */
async function verifyUser(
  accessToken: string,
): Promise<{ id: string } | null> {
  const url = getUrl();
  const key = getKey();
  if (!url || !key) return null;

  try {
    const res = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as { id: string };
  } catch {
    return null;
  }
}

/**
 * Refreshes the auth session using the refresh token.
 * Returns new tokens on success, null on failure.
 */
async function refreshSession(
  refreshToken: string,
): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
} | null> {
  const url = getUrl();
  const key = getKey();
  if (!url || !key) return null;

  try {
    const res = await fetch(
      `${url}/auth/v1/token?grant_type=refresh_token`,
      {
        method: 'POST',
        headers: {
          apikey: key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      },
    );
    if (!res.ok) return null;
    return (await res.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
  } catch {
    return null;
  }
}

/**
 * Looks up the profile role for a user. Returns the lowercase role string,
 * or null on failure.
 */
async function getUserRole(userId: string): Promise<string | null> {
  const url = getUrl();
  const key = getKey();
  if (!url || !key) return null;

  try {
    const res = await fetch(
      `${url}/rest/v1/profiles?select=role&id=eq.${encodeURIComponent(userId)}`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as { role: string }[];
    return rows[0]?.role?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API (same shape as before so middleware.ts doesn't change)
// ---------------------------------------------------------------------------

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  // -----------------------------------------------------------------------
  // 1. Get a valid session (with silent refresh)
  // -----------------------------------------------------------------------

  let userId: string | null = null;
  const { accessToken, refreshToken } = parseAuthCookie(request);

  if (accessToken) {
    // Try the current access token first.
    const user = await verifyUser(accessToken);
    if (user) {
      userId = user.id;
    } else if (refreshToken) {
      // Token expired — try to refresh.
      const refreshed = await refreshSession(refreshToken);
      if (refreshed?.access_token) {
        // Write the new tokens to the response cookie.
        const projectRef = new URL(getUrl()!).hostname.split('.')[0];
        const cookieName = `sb-${projectRef}-auth-token`;
        const cookieValue = JSON.stringify([
          refreshed.access_token,
          refreshed.refresh_token,
          // Supabase cookie value includes expires_at as third element
          Math.floor(Date.now() / 1000) + refreshed.expires_in,
        ]);
        response.cookies.set(cookieName, cookieValue, {
          path: '/',
          maxAge: refreshed.expires_in,
          sameSite: 'lax',
          httpOnly: true,
          secure: true,
        });

        const user = await verifyUser(refreshed.access_token);
        if (user) userId = user.id;
      }
    }
  }

  // -----------------------------------------------------------------------
  // 2. Route protection (identical logic to the original middleware)
  // -----------------------------------------------------------------------

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
    '/testimonies/new',
    '/testimonies/mine',
    '/prayer-wall/new',
    '/prayer-wall/mine',
  ];

  if (
    !userId &&
    authRequiredPrefixes.some((prefix) => pathname.startsWith(prefix))
  ) {
    return redirectToSignIn();
  }

  // Protected admin routes
  if (pathname.startsWith('/admin')) {
    if (!userId) {
      const url = request.nextUrl.clone();
      url.pathname = '/sign-in';
      return NextResponse.redirect(url);
    }

    // Role check — fail-closed: if the query fails, deny access.
    let role: string | undefined;
    try {
      role = (await getUserRole(userId)) ?? undefined;
    } catch {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    if (!role || (role !== 'moderator' && role !== 'admin')) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Auth pages: redirect authenticated users away to dashboard
  const authPages = ['/sign-in', '/sign-up', '/magic-link', '/forgot-password'];
  if (userId && authPages.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}
