'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canModerate, fromPrismaRole } from '@/lib/auth/roles';
import { createNotification } from '@/lib/notification/actions';

const VALID_STATUSES = [
  'PENDING',
  'APPROVED',
  'ANSWERED',
  'REJECTED',
] as const;

const createPrayerRequestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be at most 200 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(5000, 'Content must be at most 5000 characters'),
  visibility: z.enum(['PUBLIC', 'ANONYMOUS', 'PRIVATE'], {
    errorMap: () => ({ message: 'Visibility must be Public, Anonymous, or Private' }),
  }),
});

export async function createPrayerRequest(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const visibility = formData.get('visibility') as string;

  const validation = createPrayerRequestSchema.safeParse({ title, content, visibility });

  if (!validation.success) {
    const message = encodeURIComponent(validation.error.errors[0]?.message ?? 'Invalid input');
    redirect(`/prayer-wall/new?error=${message}`);
  }

  try {
    await prisma.prayerRequest.create({
      data: {
        title,
        content,
        authorId: user.id,
        visibility: validation.data.visibility,
        status: validation.data.visibility === 'PRIVATE' ? 'APPROVED' : 'PENDING',
      },
    });
  } catch {
    const message = encodeURIComponent('Unable to create prayer request. Please try again.');
    redirect(`/prayer-wall/new?error=${message}`);
  }

  redirect('/prayer-wall/mine');
}

export async function getApprovedPrayerRequests(limit?: number) {
  return prisma.prayerRequest.findMany({
    where: {
      status: { in: ['APPROVED', 'ANSWERED'] },
      visibility: { in: ['PUBLIC', 'ANONYMOUS'] },
    },
    include: {
      author: { select: { displayName: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit ?? 50,
  });
}

export async function getMyPrayerRequests() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  return prisma.prayerRequest.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPendingPrayerRequests() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  const role = fromPrismaRole(profile?.role ?? null);

  if (!canModerate(role)) {
    redirect('/dashboard');
  }

  return prisma.prayerRequest.findMany({
    where: { status: 'PENDING' },
    include: {
      author: { select: { displayName: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function updatePrayerRequestStatus(
  requestId: string,
  newStatus: string,
) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  const role = fromPrismaRole(profile?.role ?? null);

  if (!canModerate(role)) {
    redirect('/dashboard');
  }

  // Validate status enum
  if (!VALID_STATUSES.includes(newStatus as typeof VALID_STATUSES[number])) {
    return;
  }

  const answeredAt = newStatus === 'ANSWERED' ? new Date() : undefined;

  try {
    await prisma.prayerRequest.update({
      where: { id: requestId },
      data: {
        status: newStatus as typeof VALID_STATUSES[number],
        ...(answeredAt !== undefined && { answeredAt }),
      },
    });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      // Record not found - prayer request may have been deleted
      revalidatePath('/admin/prayers');
      return;
    }
    revalidatePath('/admin/prayers');
    return;
  }

  revalidatePath('/admin/prayers');
  revalidatePath('/prayer-wall');
}

export async function prayForRequest(prayerRequestId: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  // Verify the prayer request exists and is eligible for intercession
  const prayerRequest = await prisma.prayerRequest.findFirst({
    where: {
      id: prayerRequestId,
      status: { in: ['APPROVED', 'ANSWERED'] },
      visibility: { in: ['PUBLIC', 'ANONYMOUS'] },
    },
  });

  if (!prayerRequest) {
    return;
  }

  // Use a transaction for atomicity: upsert intercession + increment count
  const isNew = await prisma.$transaction(async (tx) => {
    const existing = await tx.prayerIntercession.findUnique({
      where: {
        prayerRequestId_userId: {
          prayerRequestId,
          userId: user.id,
        },
      },
    });

    if (existing) {
      // Already prayed - update createdAt but do not increment count
      await tx.prayerIntercession.update({
        where: { id: existing.id },
        data: { createdAt: new Date() },
      });
      return false;
    }

    await tx.prayerIntercession.create({
      data: {
        prayerRequestId,
        userId: user.id,
      },
    });

    await tx.prayerRequest.update({
      where: { id: prayerRequestId },
      data: { prayerCount: { increment: 1 } },
    });

    return true;
  });

  // Notify the prayer request author (only for new intercessions, not self)
  if (isNew && prayerRequest.authorId !== user.id) {
    try {
      await createNotification(
        prayerRequest.authorId,
        'PRAYER_REPLY',
        'Someone prayed for you',
        'A member of Light and Salt has interceded for your prayer request.',
        '/prayer-wall',
      );
    } catch {
      // Notifications are non-critical
    }
  }

  revalidatePath('/prayer-wall');
}
