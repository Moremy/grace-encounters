'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be at most 50 characters')
    .nullable()
    .optional(),
  bio: z
    .string()
    .max(500, 'Bio must be at most 500 characters')
    .nullable()
    .optional(),
  avatarUrl: z
    .union([z.string().url('Must be a valid URL'), z.literal('')])
    .nullable()
    .optional(),
});

export async function getPublicProfile(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: {
      displayName: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      _count: {
        select: {
          testimonies: {
            where: { status: { in: ['APPROVED', 'FEATURED'] } },
          },
          prayerIntercessions: true,
          communityGroupMembers: true,
        },
      },
    },
  });

  if (!profile) {
    return null;
  }

  return {
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    bio: profile.bio,
    createdAt: profile.createdAt,
    testimoniesCount: profile._count.testimonies,
    prayerCount: profile._count.prayerIntercessions,
    groupsCount: profile._count.communityGroupMembers,
  };
}

export async function getMyProfile() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          testimonies: {
            where: { status: { in: ['APPROVED', 'FEATURED'] } },
          },
          prayerIntercessions: true,
          communityGroupMembers: true,
        },
      },
    },
  });

  if (!profile) {
    redirect('/sign-in');
  }

  return profile;
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const displayName = (formData.get('displayName') as string) || null;
  const bio = (formData.get('bio') as string) || null;
  const avatarUrl = (formData.get('avatarUrl') as string) || null;

  const validation = updateProfileSchema.safeParse({
    displayName,
    bio,
    avatarUrl,
  });

  if (!validation.success) {
    const message = encodeURIComponent(
      validation.error.errors[0]?.message ?? 'Invalid input',
    );
    redirect(`/profile/edit?error=${message}`);
  }

  try {
    await prisma.profile.update({
      where: { id: user.id },
      data: {
        displayName: validation.data.displayName ?? null,
        bio: validation.data.bio ?? null,
        avatarUrl: validation.data.avatarUrl || null,
      },
    });
  } catch {
    const message = encodeURIComponent(
      'Unable to update profile. Please try again.',
    );
    redirect(`/profile/edit?error=${message}`);
  }

  revalidatePath('/profile');
  revalidatePath(`/profile/${user.id}`);
  redirect('/profile');
}
