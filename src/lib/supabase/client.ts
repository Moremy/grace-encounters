// Browser-side Supabase client factory. Safe to import from client components and hooks.
// The non-null assertions on env vars are guarded at boot by `src/lib/env.ts` (added in FEAT-010),
// which validates that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.
import { createBrowserClient } from '@supabase/ssr';

/**
 * Use in client components / hooks.
 * Reads tokens from cookies set by the middleware.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
