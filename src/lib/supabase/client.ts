// Browser-side Supabase client factory. Safe to import from client components and hooks.
// Importing `@/lib/env` here triggers zod validation of the public schema as soon as
// this module is parsed in the browser bundle, so a missing or malformed
// NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY fails fast with the
// loader's labeled error instead of silently constructing a client with "undefined".
import { createBrowserClient } from '@supabase/ssr';

import '@/lib/env';

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
