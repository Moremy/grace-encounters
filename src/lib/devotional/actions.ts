'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canModerate, fromPrismaRole } from '@/lib/auth/roles';
import { broadcastPush } from '@/lib/push-notifications/send';
import { slugify } from './utils';

const VALID_STATUSES = ['DRAFT', 'PUBLISHED', 'SCHEDULED'] as const;

const createDevotionalSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be at most 200 characters'),
  scripture: z
    .string()
    .min(3, 'Scripture must be at least 3 characters'),
  scriptureReference: z
    .string()
    .min(3, 'Scripture reference must be at least 3 characters')
    .max(100, 'Scripture reference must be at most 100 characters'),
  excerpt: z
    .string()
    .min(10, 'Excerpt must be at least 10 characters')
    .max(300, 'Excerpt must be at most 300 characters'),
  content: z
    .string()
    .min(20, 'Content must be at least 20 characters'),
  status: z.enum(VALID_STATUSES).default('DRAFT'),
});

export async function createDevotional(formData: FormData) {
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
    redirect('/admin/devotionals');
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const scripture = formData.get('scripture') as string;
  const scriptureReference = formData.get('scriptureReference') as string;
  const excerpt = formData.get('excerpt') as string;
  const statusRaw = (formData.get('status') as string) || 'DRAFT';
  const publishDateRaw = formData.get('publishDate') as string;

  const validation = createDevotionalSchema.safeParse({
    title,
    content,
    scripture,
    scriptureReference,
    excerpt,
    status: statusRaw,
  });

  if (!validation.success) {
    const message = encodeURIComponent(
      validation.error.errors[0]?.message ?? 'Invalid input',
    );
    redirect(`/admin/devotionals/new?error=${message}`);
  }

  const { status } = validation.data;

  if (status === 'SCHEDULED' && !publishDateRaw) {
    const message = encodeURIComponent(
      'Publish date is required for scheduled devotionals.',
    );
    redirect(`/admin/devotionals/new?error=${message}`);
  }

  let publishDate: Date | null = null;

  if (status === 'SCHEDULED' && publishDateRaw) {
    publishDate = new Date(publishDateRaw);
  }

  if (status === 'PUBLISHED') {
    publishDate = new Date();
  }

  const slug = slugify(title);
  let createdSlug = slug;

  try {
    await prisma.devotional.create({
      data: {
        slug,
        title,
        content,
        scripture,
        scriptureReference,
        excerpt,
        authorId: user.id,
        status: status as (typeof VALID_STATUSES)[number],
        publishDate,
      },
    });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      // Slug collision - retry once with a new slug
      const retrySlug = slugify(title);
      try {
        await prisma.devotional.create({
          data: {
            slug: retrySlug,
            title,
            content,
            scripture,
            scriptureReference,
            excerpt,
            authorId: user.id,
            status: status as (typeof VALID_STATUSES)[number],
            publishDate,
          },
        });
        createdSlug = retrySlug;
      } catch (retryErr: unknown) {
        const message = encodeURIComponent(
          'Unable to create devotional. Please try again.',
        );
        redirect(`/admin/devotionals/new?error=${message}`);
      }
    } else {
      const message = encodeURIComponent(
        'Unable to create devotional. Please try again.',
      );
      redirect(`/admin/devotionals/new?error=${message}`);
    }
  }

  if (status === 'PUBLISHED') {
    await broadcastPush(
      {
        title: 'New Devotional',
        body: title,
        url: `/devotionals/${createdSlug}`,
      },
      'devotionalNotifications',
    );
  }

  redirect('/admin/devotionals');
}

export async function updateDevotionalStatus(
  devotionalId: string,
  newStatus: string,
) {
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

  // Validate status enum
  if (!VALID_STATUSES.includes(newStatus as (typeof VALID_STATUSES)[number])) {
    return;
  }

  const publishDate = newStatus === 'PUBLISHED' ? new Date() : undefined;

  let updated;
  try {
    const previous = await prisma.devotional.findUnique({
      where: { id: devotionalId },
      select: { status: true },
    });

    updated = await prisma.devotional.update({
      where: { id: devotionalId },
      data: {
        status: newStatus as (typeof VALID_STATUSES)[number],
        ...(publishDate !== undefined && { publishDate }),
      },
    });

    if (newStatus === 'PUBLISHED' && previous?.status !== 'PUBLISHED') {
      await broadcastPush(
        {
          title: 'New Devotional',
          body: updated.title,
          url: `/devotionals/${updated.slug}`,
        },
        'devotionalNotifications',
      );
    }
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      // Record not found
      revalidatePath('/admin/devotionals');
      return;
    }
    revalidatePath('/admin/devotionals');
    return;
  }

  revalidatePath('/admin/devotionals');
  revalidatePath('/devotionals');
}

export async function getPublishedDevotionals() {
  return prisma.devotional.findMany({
    where: {
      OR: [
        { status: 'PUBLISHED', publishDate: { lte: new Date() } },
        { status: 'SCHEDULED', publishDate: { lte: new Date() } },
      ],
    },
    include: {
      author: { select: { displayName: true } },
    },
    orderBy: { publishDate: 'desc' },
  });
}

export async function getDevotionalBySlug(slug: string) {
  return prisma.devotional.findFirst({
    where: {
      slug,
      OR: [
        { status: 'PUBLISHED', publishDate: { lte: new Date() } },
        { status: 'SCHEDULED', publishDate: { lte: new Date() } },
      ],
    },
    include: {
      author: { select: { displayName: true } },
    },
  });
}

export async function getAllDevotionalsAdmin() {
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

  return prisma.devotional.findMany({
    include: {
      author: { select: { displayName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTodayDevotional() {
  return prisma.devotional.findFirst({
    where: {
      OR: [
        { status: 'PUBLISHED', publishDate: { lte: new Date() } },
        { status: 'SCHEDULED', publishDate: { lte: new Date() } },
      ],
    },
    include: {
      author: { select: { displayName: true } },
    },
    orderBy: { publishDate: 'desc' },
  });
}
