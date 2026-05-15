'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canModerate, fromPrismaRole } from '@/lib/auth/roles';
import { slugify } from '@/lib/media/utils';

export async function getPublishedSermons(filters?: {
  seriesId?: string;
  speakerId?: string;
  search?: string;
}) {
  const where: Record<string, unknown> = {
    publishedAt: { not: null },
  };

  if (filters?.seriesId) {
    where.seriesId = filters.seriesId;
  }

  if (filters?.speakerId) {
    where.speakerId = filters.speakerId;
  }

  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.sermon.findMany({
    where,
    include: {
      speaker: { select: { displayName: true, avatarUrl: true } },
      series: { select: { title: true, slug: true } },
    },
    orderBy: { publishedAt: 'desc' },
  });
}

export async function getSermonBySlug(slug: string) {
  return prisma.sermon.findFirst({
    where: { slug },
    include: {
      speaker: { select: { displayName: true, avatarUrl: true } },
      series: {
        select: {
          title: true,
          slug: true,
          sermons: {
            select: { id: true, slug: true, title: true },
            orderBy: { publishedAt: 'asc' },
          },
        },
      },
    },
  });
}

export async function getFeaturedSermons() {
  return prisma.sermon.findMany({
    where: {
      featured: true,
      publishedAt: { not: null },
    },
    include: {
      speaker: { select: { displayName: true, avatarUrl: true } },
      series: { select: { title: true, slug: true } },
    },
    orderBy: { publishedAt: 'desc' },
    take: 4,
  });
}

export async function getSermonSeries() {
  return prisma.sermonSeries.findMany({
    include: {
      _count: { select: { sermons: true } },
    },
    orderBy: { order: 'asc' },
  });
}

export async function getSeriesBySlug(slug: string) {
  return prisma.sermonSeries.findFirst({
    where: { slug },
    include: {
      sermons: {
        include: {
          speaker: { select: { displayName: true } },
        },
        orderBy: { publishedAt: 'asc' },
      },
    },
  });
}

export async function getSermonsBySpeaker(speakerId: string) {
  return prisma.sermon.findMany({
    where: {
      speakerId,
      publishedAt: { not: null },
    },
    include: {
      series: { select: { title: true, slug: true } },
    },
    orderBy: { publishedAt: 'desc' },
  });
}

export async function createSermon(formData: FormData) {
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
  const scripture = (formData.get('scripture') as string) || null;
  const seriesId = (formData.get('seriesId') as string) || null;
  const speakerId = formData.get('speakerId') as string;
  const audioUrl = (formData.get('audioUrl') as string) || null;
  const videoUrl = (formData.get('videoUrl') as string) || null;
  const transcriptUrl = (formData.get('transcriptUrl') as string) || null;
  const notesUrl = (formData.get('notesUrl') as string) || null;
  const thumbnailUrl = (formData.get('thumbnailUrl') as string) || null;
  const duration = formData.get('duration')
    ? parseInt(formData.get('duration') as string, 10)
    : null;
  const featured = formData.get('featured') === 'on';

  if (!title || !description || !speakerId) {
    redirect('/admin/sermons/new?error=Missing+required+fields');
  }

  const slug = slugify(title);

  try {
    await prisma.sermon.create({
      data: {
        slug,
        title,
        description,
        scripture,
        seriesId,
        speakerId,
        audioUrl,
        videoUrl,
        transcriptUrl,
        notesUrl,
        thumbnailUrl,
        duration,
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
      await prisma.sermon.create({
        data: {
          slug: retrySlug,
          title,
          description,
          scripture,
          seriesId,
          speakerId,
          audioUrl,
          videoUrl,
          transcriptUrl,
          notesUrl,
          thumbnailUrl,
          duration,
          featured,
          publishedAt: new Date(),
        },
      });
    } else {
      redirect('/admin/sermons/new?error=Unable+to+create+sermon');
    }
  }

  revalidatePath('/sermons');
  revalidatePath('/admin/sermons');
  redirect('/admin/sermons');
}

export async function createSeries(formData: FormData) {
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
  const coverImageUrl = (formData.get('coverImageUrl') as string) || null;
  const order = formData.get('order')
    ? parseInt(formData.get('order') as string, 10)
    : 0;

  if (!title || !description) {
    redirect('/admin/sermons?error=Missing+required+fields');
  }

  const slug = slugify(title);

  try {
    await prisma.sermonSeries.create({
      data: {
        slug,
        title,
        description,
        coverImageUrl,
        order,
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
      await prisma.sermonSeries.create({
        data: {
          slug: retrySlug,
          title,
          description,
          coverImageUrl,
          order,
        },
      });
    } else {
      redirect('/admin/sermons?error=Unable+to+create+series');
    }
  }

  revalidatePath('/sermons');
  revalidatePath('/admin/sermons');
  redirect('/admin/sermons');
}
