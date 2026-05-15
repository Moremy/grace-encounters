'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canModerate, fromPrismaRole } from '@/lib/auth/roles';
import { slugify } from './utils';

const VALID_STATUSES = [
  'PENDING',
  'APPROVED',
  'NEEDS_REVISION',
  'REJECTED',
  'FEATURED',
] as const;

const createTestimonySchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title must be at most 200 characters'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters').max(200, 'Excerpt must be at most 200 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
});

export async function createTestimony(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const excerpt = formData.get('excerpt') as string;

  const validation = createTestimonySchema.safeParse({ title, excerpt, content });

  if (!validation.success) {
    const message = encodeURIComponent(validation.error.errors[0]?.message ?? 'Invalid input');
    redirect(`/testimonies/new?error=${message}`);
  }

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

  await prisma.testimony.update({
    where: { id: testimonyId },
    data: {
      status: newStatus as typeof VALID_STATUSES[number],
      revisionNote: revisionNote ?? null,
      publishedAt,
      featured: newStatus === 'FEATURED',
    },
  });

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
