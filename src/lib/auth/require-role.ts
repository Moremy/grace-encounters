import { redirect } from 'next/navigation';
import { hasRole, fromPrismaRole, type Role } from '@/lib/auth/roles';
import { getCurrentProfile, type CurrentProfile } from '@/lib/auth/get-current-profile';

export type RequireOptions = {
  /** Path to redirect unauthenticated users to. Default: '/sign-in'. */
  signInPath?: string;
  /** Path to redirect authorized-but-insufficient-role users to. Default: '/'. */
  forbiddenPath?: string;
  /** When provided, appended as `?next=` on the sign-in redirect for round-trip. */
  next?: string;
};

export async function requireUser(opts: RequireOptions = {}): Promise<CurrentProfile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    const signIn = opts.signInPath ?? '/sign-in';
    const next = opts.next ? `?next=${encodeURIComponent(opts.next)}` : '';
    redirect(`${signIn}${next}`);
  }
  return profile;
}

export async function requireRole(role: Role, opts: RequireOptions = {}): Promise<CurrentProfile> {
  const profile = await requireUser(opts);
  const actual = fromPrismaRole(profile.role as 'USER' | 'MODERATOR' | 'ADMIN');
  if (!hasRole(actual, role)) {
    redirect(opts.forbiddenPath ?? '/');
  }
  return profile;
}
