'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canAdmin, fromPrismaRole } from '@/lib/auth/roles';

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  const role = fromPrismaRole(profile?.role ?? null);

  if (!canAdmin(role)) {
    redirect('/dashboard');
  }

  return user;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModerationQueueItem {
  id: string;
  type: 'testimony' | 'prayer';
  title: string;
  content: string;
  authorName: string | null;
  authorId: string;
  status: string;
  createdAt: Date;
}

export interface ModerationStats {
  pendingTestimonies: number;
  pendingPrayers: number;
  approvedToday: number;
  rejectedToday: number;
}

// ---------------------------------------------------------------------------
// Get Moderation Queue
// ---------------------------------------------------------------------------

export async function getModerationQueue(
  type?: 'testimony' | 'prayer',
  page: number = 1,
): Promise<{ items: ModerationQueueItem[]; total: number }> {
  await requireAdmin();

  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  let testimonies: ModerationQueueItem[] = [];
  let prayers: ModerationQueueItem[] = [];
  let total = 0;

  if (!type || type === 'testimony') {
    const [items, count] = await Promise.all([
      prisma.testimony.findMany({
        where: { status: 'PENDING' },
        select: {
          id: true,
          title: true,
          content: true,
          status: true,
          createdAt: true,
          authorId: true,
          author: { select: { displayName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: type ? pageSize : 10,
        skip: type ? skip : 0,
      }),
      prisma.testimony.count({ where: { status: 'PENDING' } }),
    ]);

    testimonies = items.map((t) => ({
      id: t.id,
      type: 'testimony' as const,
      title: t.title,
      content: t.content.slice(0, 200),
      authorName: t.author.displayName,
      authorId: t.authorId,
      status: t.status,
      createdAt: t.createdAt,
    }));
    total += count;
  }

  if (!type || type === 'prayer') {
    const [items, count] = await Promise.all([
      prisma.prayerRequest.findMany({
        where: { status: 'PENDING' },
        select: {
          id: true,
          title: true,
          content: true,
          status: true,
          createdAt: true,
          authorId: true,
          author: { select: { displayName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: type ? pageSize : 10,
        skip: type ? skip : 0,
      }),
      prisma.prayerRequest.count({ where: { status: 'PENDING' } }),
    ]);

    prayers = items.map((p) => ({
      id: p.id,
      type: 'prayer' as const,
      title: p.title,
      content: p.content.slice(0, 200),
      authorName: p.author.displayName,
      authorId: p.authorId,
      status: p.status,
      createdAt: p.createdAt,
    }));
    total += count;
  }

  const allItems = [...testimonies, ...prayers].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  return { items: allItems, total };
}

// ---------------------------------------------------------------------------
// Moderation Actions
// ---------------------------------------------------------------------------

export async function approveContent(
  type: 'testimony' | 'prayer',
  id: string,
): Promise<void> {
  await requireAdmin();

  if (type === 'testimony') {
    await prisma.testimony.update({
      where: { id },
      data: { status: 'APPROVED', publishedAt: new Date() },
    });
  } else {
    await prisma.prayerRequest.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
  }

  revalidatePath('/admin/moderation');
  revalidatePath('/admin');
}

export async function rejectContent(
  type: 'testimony' | 'prayer',
  id: string,
  reason: string,
): Promise<void> {
  await requireAdmin();

  if (type === 'testimony') {
    await prisma.testimony.update({
      where: { id },
      data: { status: 'REJECTED', revisionNote: reason },
    });
  } else {
    await prisma.prayerRequest.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }

  revalidatePath('/admin/moderation');
  revalidatePath('/admin');
}

export async function flagContent(
  type: 'testimony' | 'prayer',
  id: string,
  reason: string,
): Promise<void> {
  await requireAdmin();

  if (type === 'testimony') {
    await prisma.testimony.update({
      where: { id },
      data: { status: 'NEEDS_REVISION', revisionNote: reason },
    });
  } else {
    // Prayer requests don't have a NEEDS_REVISION status, mark as REJECTED with note
    await prisma.prayerRequest.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
  }

  revalidatePath('/admin/moderation');
  revalidatePath('/admin');
}

// ---------------------------------------------------------------------------
// Moderation Stats
// ---------------------------------------------------------------------------

export async function getModerationStats(): Promise<ModerationStats> {
  await requireAdmin();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [pendingTestimonies, pendingPrayers, approvedToday, rejectedToday] =
    await Promise.all([
      prisma.testimony.count({ where: { status: 'PENDING' } }),
      prisma.prayerRequest.count({ where: { status: 'PENDING' } }),
      prisma.testimony.count({
        where: {
          status: 'APPROVED',
          updatedAt: { gte: todayStart },
        },
      }),
      prisma.testimony.count({
        where: {
          status: 'REJECTED',
          updatedAt: { gte: todayStart },
        },
      }),
    ]);

  return {
    pendingTestimonies,
    pendingPrayers,
    approvedToday,
    rejectedToday,
  };
}
