import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Validates that a redirect path is safe (starts with exactly one slash
 * followed by a non-slash character, preventing open redirects like //evil.com).
 */
function isValidRedirectPath(path: string): boolean {
  return /^\/[^/]/.test(path);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const nextParam = searchParams.get('next') ?? '/dashboard';
  const next = isValidRedirectPath(nextParam) ? nextParam : '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=Could not authenticate`);
}
