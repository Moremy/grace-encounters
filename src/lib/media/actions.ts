'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canModerate, fromPrismaRole } from '@/lib/auth/roles';
import { slugify } from './utils';

export async function getPublishedMedia(filters?: {
  mediaType?: string;
  category?: string;
  search?: string;
}) {
  const where: Record<string, unknown> = {
    publishedAt: { not: null },
  };

  if (filters?.mediaType) {
    where.mediaType = filters.mediaType;
  }

  if (filters?.category) {
    where.category = filters.category;
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.mediaItem.findMany({
    where,
    include: {
      speaker: { select: { displayName: true } },
      playlist: { select: { title: true, slug: true } },
    },
    orderBy: { publishedAt: 'desc' },
  });
}

export async function getMediaBySlug(slug: string) {
  return prisma.mediaItem.findFirst({
    where: { slug },
    include: {
      speaker: { select: { displayName: true, avatarUrl: true } },
      playlist: { select: { title: true, slug: true } },
    },
  });
}

export async function getFeaturedMedia() {
  return prisma.mediaItem.findMany({
    where: {
      featured: true,
      publishedAt: { not: null },
    },
    include: {
      speaker: { select: { displayName: true } },
    },
    orderBy: { publishedAt: 'desc' },
    take: 6,
  });
}

export async function getMediaPlaylists() {
  return prisma.mediaPlaylist.findMany({
    include: {
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPlaylistBySlug(slug: string) {
  return prisma.mediaPlaylist.findFirst({
    where: { slug },
    include: {
      items: {
        include: {
          speaker: { select: { displayName: true } },
        },
        orderBy: { publishedAt: 'desc' },
      },
    },
  });
}

export async function searchMedia(query: string) {
  return prisma.mediaItem.findMany({
    where: {
      publishedAt: { not: null },
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      speaker: { select: { displayName: true } },
    },
    orderBy: { publishedAt: 'desc' },
  });
}

export async function createMediaItem(formData: FormData) {
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
  const mediaType = formData.get('mediaType') as string;
  const url = formData.get('url') as string;
  const thumbnailUrl = (formData.get('thumbnailUrl') as string) || null;
  const duration = formData.get('duration')
    ? parseInt(formData.get('duration') as string, 10)
    : null;
  const category = formData.get('category') as string;
  const playlistId = (formData.get('playlistId') as string) || null;
  const speakerId = (formData.get('speakerId') as string) || null;
  const featured = formData.get('featured') === 'on';

  if (!title || !description || !mediaType || !url || !category) {
    redirect('/admin/media/new?error=Missing+required+fields');
  }

  const slug = slugify(title);

  try {
    await prisma.mediaItem.create({
      data: {
        slug,
        title,
        description,
        mediaType: mediaType as 'SERMON_AUDIO' | 'SERMON_VIDEO' | 'WORSHIP_AUDIO' | 'VIDEO_MESSAGE' | 'PDF_RESOURCE',
        url,
        thumbnailUrl,
        duration,
        category: category as 'SERMON' | 'WORSHIP' | 'TEACHING' | 'TESTIMONY' | 'CONFERENCE',
        playlistId,
        speakerId,
        featured,
        publishedAt: new Date(),
      },
    });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      const retrySlug = slugify(title);
      await prisma.mediaItem.create({
        data: {
          slug: retrySlug,
          title,
          description,
          mediaType: mediaType as 'SERMON_AUDIO' | 'SERMON_VIDEO' | 'WORSHIP_AUDIO' | 'VIDEO_MESSAGE' | 'PDF_RESOURCE',
          url,
          thumbnailUrl,
          duration,
          category: category as 'SERMON' | 'WORSHIP' | 'TEACHING' | 'TESTIMONY' | 'CONFERENCE',
          playlistId,
          speakerId,
          featured,
          publishedAt: new Date(),
        },
      });
    } else {
      redirect('/admin/media/new?error=Unable+to+create+media+item');
    }
  }

  revalidatePath('/media');
  revalidatePath('/admin/media');
  redirect('/admin/media');
}

export async function deleteMediaItem(id: string) {
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

  try {
    await prisma.mediaItem.delete({
      where: { id },
    });
  } catch {
    // Record not found or other error
  }

  revalidatePath('/media');
  revalidatePath('/admin/media');
}
