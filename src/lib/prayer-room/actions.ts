'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canModerate, fromPrismaRole } from '@/lib/auth/roles';
import { slugify } from './utils';

const createRoomSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be at most 2000 characters'),
  scheduledAt: z.string().optional(),
  maxParticipants: z.coerce.number().int().min(2).max(500).default(50),
});

export async function getPrayerRooms() {
  const liveRooms = await prisma.prayerRoom.findMany({
    where: { isLive: true },
    include: {
      _count: { select: { participants: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const upcomingRooms = await prisma.prayerRoom.findMany({
    where: {
      isLive: false,
      endAt: null,
      scheduledAt: { gt: new Date() },
    },
    include: {
      _count: { select: { participants: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  return { liveRooms, upcomingRooms };
}

export async function getPrayerRoomBySlug(slug: string) {
  return prisma.prayerRoom.findUnique({
    where: { slug },
    include: {
      _count: { select: { participants: true } },
      participants: {
        include: {
          user: { select: { id: true, displayName: true, avatarUrl: true } },
        },
      },
      createdBy: { select: { displayName: true } },
    },
  });
}

export async function createPrayerRoom(formData: FormData) {
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

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const scheduledAt = formData.get('scheduledAt') as string;
  const maxParticipants = formData.get('maxParticipants') as string;

  const validation = createRoomSchema.safeParse({
    title,
    description,
    scheduledAt: scheduledAt || undefined,
    maxParticipants: maxParticipants ? Number(maxParticipants) : 50,
  });

  if (!validation.success) {
    const message = encodeURIComponent(
      validation.error.errors[0]?.message ?? 'Invalid input',
    );
    redirect(`/prayer-rooms/new?error=${message}`);
  }

  const slug = slugify(validation.data.title);

  try {
    await prisma.prayerRoom.create({
      data: {
        slug,
        title: validation.data.title,
        description: validation.data.description,
        scheduledAt: validation.data.scheduledAt
          ? new Date(validation.data.scheduledAt)
          : null,
        maxParticipants: validation.data.maxParticipants,
        createdById: user.id,
      },
    });
  } catch {
    const message = encodeURIComponent(
      'Unable to create prayer room. Please try again.',
    );
    redirect(`/prayer-rooms/new?error=${message}`);
  }

  revalidatePath('/prayer-rooms');
  redirect('/prayer-rooms');
}

export async function joinPrayerRoom(roomId: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const room = await prisma.prayerRoom.findUnique({
    where: { id: roomId },
    include: { _count: { select: { participants: true } } },
  });

  if (!room) return;

  if (room._count.participants >= room.maxParticipants) {
    return;
  }

  try {
    await prisma.prayerRoomParticipant.create({
      data: {
        roomId,
        userId: user.id,
      },
    });
  } catch {
    // Already a participant (unique constraint)
  }

  revalidatePath(`/prayer-rooms`);
}

export async function leavePrayerRoom(roomId: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  try {
    await prisma.prayerRoomParticipant.deleteMany({
      where: {
        roomId,
        userId: user.id,
      },
    });
  } catch {
    // Not a participant
  }

  revalidatePath(`/prayer-rooms`);
}

export async function getPrayerRoomMessages(roomId: string) {
  return prisma.prayerRoomMessage.findMany({
    where: { roomId },
    include: {
      author: { select: { displayName: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function sendPrayerRoomMessage(roomId: string, content: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const trimmed = content.trim();
  if (trimmed.length < 1 || trimmed.length > 1000) {
    return;
  }

  try {
    await prisma.prayerRoomMessage.create({
      data: {
        roomId,
        authorId: user.id,
        content: trimmed,
      },
    });
  } catch {
    // Room may have been deleted
  }

  revalidatePath(`/prayer-rooms`);
}

export async function togglePrayerRoomLive(roomId: string) {
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

  const room = await prisma.prayerRoom.findUnique({
    where: { id: roomId },
    select: { isLive: true },
  });

  if (!room) return;

  await prisma.prayerRoom.update({
    where: { id: roomId },
    data: { isLive: !room.isLive },
  });

  revalidatePath('/prayer-rooms');
}

export async function endPrayerRoom(roomId: string) {
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

  await prisma.prayerRoom.update({
    where: { id: roomId },
    data: {
      isLive: false,
      endAt: new Date(),
    },
  });

  revalidatePath('/prayer-rooms');
}

export async function getScheduledPrayerRooms() {
  return prisma.prayerRoom.findMany({
    where: {
      isLive: false,
      endAt: null,
      scheduledAt: { gt: new Date() },
    },
    include: {
      _count: { select: { participants: true } },
      createdBy: { select: { displayName: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  });
}

export async function getAllPrayerRooms() {
  return prisma.prayerRoom.findMany({
    include: {
      _count: { select: { participants: true } },
      createdBy: { select: { displayName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
