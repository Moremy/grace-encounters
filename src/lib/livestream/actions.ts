'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canModerate, fromPrismaRole } from '@/lib/auth/roles';
import { slugify } from '@/lib/slugify';

export async function getUpcomingStreams() {
  return prisma.liveStream.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledAt: { gt: new Date() },
    },
    include: {
      createdBy: { select: { displayName: true, avatarUrl: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  });
}

export async function getLiveStreams() {
  return prisma.liveStream.findMany({
    where: { status: 'LIVE' },
    include: {
      createdBy: { select: { displayName: true, avatarUrl: true } },
    },
    orderBy: { startedAt: 'desc' },
  });
}

export async function getStreamBySlug(slug: string) {
  return prisma.liveStream.findUnique({
    where: { slug },
    include: {
      createdBy: { select: { displayName: true, avatarUrl: true } },
      replay: true,
    },
  });
}

export async function getStreamChat(streamId: string, after?: string) {
  const where: Record<string, unknown> = { streamId };

  if (after) {
    where.createdAt = { gt: new Date(after) };
  }

  return prisma.liveStreamChat.findMany({
    where,
    include: {
      author: { select: { displayName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });
}

export async function sendChatMessage(streamId: string, content: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const trimmed = content.trim();
  if (trimmed.length < 1 || trimmed.length > 500) {
    return;
  }

  try {
    await prisma.liveStreamChat.create({
      data: {
        streamId,
        authorId: user.id,
        content: trimmed,
      },
    });
  } catch {
    // Stream may have been deleted
  }

  revalidatePath('/live');
}

export async function startStream(streamId: string) {
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

  if (!canModerate(role)) {
    redirect('/dashboard');
  }

  await prisma.liveStream.update({
    where: { id: streamId },
    data: {
      status: 'LIVE',
      startedAt: new Date(),
    },
  });

  revalidatePath('/live');
  revalidatePath('/admin/livestreams');
}

export async function endStream(streamId: string) {
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

  if (!canModerate(role)) {
    redirect('/dashboard');
  }

  await prisma.liveStream.update({
    where: { id: streamId },
    data: {
      status: 'ENDED',
      endedAt: new Date(),
    },
  });

  revalidatePath('/live');
  revalidatePath('/admin/livestreams');
}

export async function createStream(formData: FormData) {
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

  if (!canModerate(role)) {
    redirect('/dashboard');
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const streamUrl = (formData.get('streamUrl') as string) || null;
  const thumbnailUrl = (formData.get('thumbnailUrl') as string) || null;
  const streamType = (formData.get('streamType') as string) || 'WORSHIP';
  const scheduledAt = formData.get('scheduledAt') as string;

  if (!title || !description) {
    redirect('/admin/livestreams/new?error=Missing+required+fields');
  }

  const slug = slugify(title);

  try {
    await prisma.liveStream.create({
      data: {
        slug,
        title,
        description,
        streamUrl,
        thumbnailUrl,
        streamType: streamType as 'WORSHIP' | 'SERMON' | 'EVENT' | 'SPECIAL',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        createdById: user.id,
      },
    });
  } catch {
    redirect('/admin/livestreams/new?error=Unable+to+create+stream');
  }

  revalidatePath('/live');
  revalidatePath('/admin/livestreams');
  redirect('/admin/livestreams');
}

export async function getStreamReplays() {
  return prisma.liveStream.findMany({
    where: {
      status: 'ENDED',
      replay: { isNot: null },
    },
    include: {
      createdBy: { select: { displayName: true, avatarUrl: true } },
      replay: true,
    },
    orderBy: { endedAt: 'desc' },
  });
}

export async function getAllStreams() {
  return prisma.liveStream.findMany({
    include: {
      createdBy: { select: { displayName: true, avatarUrl: true } },
      _count: { select: { chatMessages: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
