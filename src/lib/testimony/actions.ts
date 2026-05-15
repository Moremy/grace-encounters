'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canModerate, fromPrismaRole } from '@/lib/auth/roles';
import { slugify } from './utils';

export async function createTestimony(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const excerpt = formData.get('excerpt') as string;

  const slug = slugify(title);

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

  const publishedAt =
    newStatus === 'APPROVED' || newStatus === 'FEATURED' ? new Date() : null;

  await prisma.testimony.update({
    where: { id: testimonyId },
    data: {
      status: newStatus as 'PENDING' | 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED' | 'FEATURED',
      revisionNote: revisionNote ?? null,
      publishedAt,
      featured: newStatus === 'FEATURED',
    },
  });
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

export async function getMyTestimonies(userId: string) {
  return prisma.testimony.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPendingTestimonies() {
  return prisma.testimony.findMany({
    where: { status: 'PENDING' },
    include: {
      author: { select: { displayName: true } },
    },
    orderBy: { createdAt: 'asc' },
  });
}
