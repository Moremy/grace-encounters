import { cache } from 'react';
import type { Profile } from '@prisma/client';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export type CurrentProfile = Profile & { authEmail: string };

/**
 * Server-side helper. Returns the signed-in user's Profile row joined with
 * the canonical email from auth.users, or null when no user is signed in.
 *
 * Wrapped in React's cache() so repeated calls within a single render share a
 * single Supabase + Prisma round trip.
 */
export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const profile = await prisma.profile.findUnique({ where: { id: data.user.id } });
  if (!profile) return null;
  return { ...profile, authEmail: data.user.email ?? profile.email };
});
