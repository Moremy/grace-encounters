/**
 * Server-side Supabase client factory.
 * Use in server components, route handlers, and server actions.
 *
 * Note: `await cookies()` works in both Next 14 (where cookies() is sync — awaiting a
 * non-thenable resolves to itself) and Next 15 (where cookies() returns a Promise).
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            /* RSC: ignore — middleware refreshes */
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            /* RSC: ignore */
          }
        },
      },
    },
  );
}
