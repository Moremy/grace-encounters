'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canModerate, fromPrismaRole } from '@/lib/auth/roles';
import { slugify } from './utils';
import { createTestimonySchema } from './schemas';

const VALID_STATUSES = [
  'PENDING',
  'APPROVED',
  'NEEDS_REVISION',
  'REJECTED',
  'FEATURED',
] as const;

export async function createTestimony(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const excerpt = formData.get('excerpt') as string;
  const mediaType = (formData.get('mediaType') as string) || 'TEXT';
  const mediaUrl = (formData.get('mediaUrl') as string) || undefined;
  const thumbnailUrl = (formData.get('thumbnailUrl') as string) || undefined;
  const category = (formData.get('category') as string) || undefined;
  const tagsRaw = (formData.get('tags') as string) || '';

  const validation = createTestimonySchema.safeParse({
    title,
    excerpt,
    content,
    mediaType,
    mediaUrl,
    thumbnailUrl,
    category: category || undefined,
    tags: tagsRaw,
  });

  if (!validation.success) {
    const message = encodeURIComponent(validation.error.errors[0]?.message ?? 'Invalid input');
    redirect(`/testimonies/new?error=${message}`);
  }

  // Parse tags from comma-separated string
  const tags = tagsRaw
    ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const slug = slugify(title);

  try {
    await prisma.testimony.create({
      data: {
        slug,
        title,
        content,
        excerpt,
        authorId: user.id,
        status: 'PENDING',
        mediaType: mediaType as 'TEXT' | 'PDF' | 'AUDIO' | 'VIDEO',
        mediaUrl: mediaUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        category: category as 'HEALING' | 'SALVATION' | 'DELIVERANCE' | 'PROVISION' | 'RESTORATION' | 'FAITH' | 'OTHER' | undefined,
        tags,
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
        await prisma.testimony.create({
          data: {
            slug: retrySlug,
            title,
            content,
            excerpt,
            authorId: user.id,
            status: 'PENDING',
            mediaType: mediaType as 'TEXT' | 'PDF' | 'AUDIO' | 'VIDEO',
            mediaUrl: mediaUrl || null,
            thumbnailUrl: thumbnailUrl || null,
            category: category as 'HEALING' | 'SALVATION' | 'DELIVERANCE' | 'PROVISION' | 'RESTORATION' | 'FAITH' | 'OTHER' | undefined,
            tags,
          },
        });
      } catch (retryErr: unknown) {
        const message = encodeURIComponent('Unable to create testimony. Please try again.');
        redirect(`/testimonies/new?error=${message}`);
      }
    } else {
      const message = encodeURIComponent('Unable to create testimony. Please try again.');
      redirect(`/testimonies/new?error=${message}`);
    }
  }

  redirect('/testimonies/mine');
}

export async function updateTestimonyStatus(
  testimonyId: string,
  newStatus: string,
  revisionNote?: string,
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

  const publishedAt =
    newStatus === 'APPROVED' || newStatus === 'FEATURED' ? new Date() : null;

  try {
    await prisma.testimony.update({
      where: { id: testimonyId },
      data: {
        status: newStatus as typeof VALID_STATUSES[number],
        revisionNote: revisionNote ?? null,
        publishedAt,
        featured: newStatus === 'FEATURED',
      },
    });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      // Record not found - testimony may have been deleted
      revalidatePath('/admin/reviews');
      return;
    }
    // Other errors - revalidate and return gracefully
    revalidatePath('/admin/reviews');
    return;
  }

  revalidatePath('/admin/reviews');
  revalidatePath('/testimonies');
}

export async function getApprovedTestimonies() {
  return prisma.testimony.findMany({
    where: {
      status: { in: ['APPROVED', 'FEATURED'] },
    },
    include: {
      author: { select: { displayName: true } },
    },
    orderBy: { publishedAt: 'desc' },
  });
}

export async function getTestimonyBySlug(slug: string) {
  return prisma.testimony.findFirst({
    where: {
      slug,
      status: { in: ['APPROVED', 'FEATURED'] },
    },
    include: {
      author: { select: { displayName: true } },
    },
  });
}

export async function getMyTestimonies() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  return prisma.testimony.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPendingTestimonies() {
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

  return prisma.testimony.findMany({
    where: { status: 'PENDING' },
    include: {
      author: { select: { displayName: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getFeaturedTestimonies() {
  return prisma.testimony.findMany({
    where: {
      OR: [{ status: 'FEATURED' }, { featured: true }],
    },
    include: {
      author: { select: { displayName: true } },
    },
    orderBy: { publishedAt: 'desc' },
    take: 10,
  });
}

export async function getTestimoniesByCategory(category: string) {
  return prisma.testimony.findMany({
    where: {
      status: { in: ['APPROVED', 'FEATURED'] },
      category: category as 'HEALING' | 'SALVATION' | 'DELIVERANCE' | 'PROVISION' | 'RESTORATION' | 'FAITH' | 'OTHER',
    },
    include: {
      author: { select: { displayName: true } },
    },
    orderBy: { publishedAt: 'desc' },
  });
}

export async function searchTestimonies(query: string) {
  return prisma.testimony.findMany({
    where: {
      status: { in: ['APPROVED', 'FEATURED'] },
      title: { contains: query, mode: 'insensitive' },
    },
    include: {
      author: { select: { displayName: true } },
    },
    orderBy: { publishedAt: 'desc' },
  });
}

export async function getFilteredTestimonies(category?: string, mediaType?: string) {
  const where: Record<string, unknown> = {
    status: { in: ['APPROVED', 'FEATURED'] },
  };

  if (category) {
    where.category = category;
  }

  if (mediaType) {
    where.mediaType = mediaType;
  }

  return prisma.testimony.findMany({
    where,
    include: {
      author: { select: { displayName: true } },
    },
    orderBy: { publishedAt: 'desc' },
  });
}
