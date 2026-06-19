'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canAdmin, fromPrismaRole } from '@/lib/auth/roles';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

/**
 * Sanitize a `next` redirect target read from form/query data. We only
 * follow paths that look like local app paths — never external URLs and
 * never protocol-relative URLs — to avoid open-redirect bugs on the
 * sign-in form.
 */
function safeNextPath(next: string | null | undefined): string | null {
  if (!next) return null;
  // Reject anything that doesn't start with a single `/`, or that starts
  // with `//` (protocol-relative) or `/\\` (Windows-style).
  if (!next.startsWith('/')) return null;
  if (next.startsWith('//') || next.startsWith('/\\')) return null;
  return next;
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const next = safeNextPath(formData.get('next') as string | null);

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Preserve `next` across the error round-trip so the user still
    // ends up where they were headed once they get the password right.
    const errParams = new URLSearchParams({ error: error.message });
    if (next) errParams.set('next', next);
    redirect(`/sign-in?${errParams.toString()}`);
  }

  const userId = data.user?.id;

  if (!userId) {
    const errParams = new URLSearchParams({ error: 'Unable to verify user' });
    if (next) errParams.set('next', next);
    redirect(`/sign-in?${errParams.toString()}`);
  }

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  const role = fromPrismaRole(profile?.role ?? null);

  // Admins always land on the admin console regardless of `next` — they
  // can navigate from there if they need to.
  if (canAdmin(role)) {
    redirect('/admin');
  }

  // If the user was bounced to sign-in from a protected page, send them
  // back to it. Otherwise default to the dashboard.
  redirect(next ?? '/dashboard');
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const displayName = formData.get('displayName') as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/verify-email');
}

export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get('email') as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/magic-link?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/magic-link?success=Check your email for the magic link');
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get('email') as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/forgot-password?success=Check your email for the reset link');
}

export async function resetPassword(formData: FormData) {
  const password = formData.get('password') as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/sign-in?success=Password updated successfully');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/sign-in');
}