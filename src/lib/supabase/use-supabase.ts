'use client';

import { useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Memoized browser Supabase client. Use inside client components and hooks
 * to avoid rebuilding the client on every render.
 */
export function useSupabase() {
  return useMemo(() => createClient(), []);
}
