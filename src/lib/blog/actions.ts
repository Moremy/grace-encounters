'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canModerate, fromPrismaRole } from '@/lib/auth/roles';
import { slugify } from './utils';

const VALID_STATUSES = ['DRAFT', 'PUBLISHED', 'SCHEDULED'] as const;

const VALID_CATEGORIES = [
  'DEVOTIONAL_THOUGHT',
  'FAITH_LIVING',
  'TESTIMONY_REFLECTION',
  'CHURCH_NEWS',
  'MISSIONS',
  'PRAYER',
] as const;

const createArticleSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be at most 200 characters'),
  excerpt: z
    .string()
    .min(10, 'Excerpt must be at least 10 characters')
    .max(300, 'Excerpt must be at most 300 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  category: z.enum(VALID_CATEGORIES),
  status: z.enum(VALID_STATUSES).default('DRAFT'),
});

export async function getPublishedArticles(category?: string) {
  const whereClause: Record<string, unknown> = {
    OR: [
      { status: 'PUBLISHED', publishDate: { lte: new Date() } },
      { status: 'SCHEDULED', publishDate: { lte: new Date() } },
    ],
  };

  if (
    category &&
    VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])
  ) {
    whereClause.category = category;
  }

  return prisma.blogArticle.findMany({
    where: whereClause,
    include: {
      author: { select: { displayName: true } },
    },
    orderBy: { publishDate: 'desc' },
  });
}

export async function getFeaturedArticles() {
  return prisma.blogArticle.findMany({
    where: {
      featured: true,
      OR: [
        { status: 'PUBLISHED', publishDate: { lte: new Date() } },
        { status: 'SCHEDULED', publishDate: { lte: new Date() } },
      ],
    },
    include: {
      author: { select: { displayName: true } },
    },
    orderBy: { publishDate: 'desc' },
    take: 3,
  });
}

export async function getArticleBySlug(slug: string) {
  return prisma.blogArticle.findFirst({
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

export async function getAllArticlesAdmin() {
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

  return prisma.blogArticle.findMany({
    include: {
      author: { select: { displayName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createArticle(formData: FormData) {
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
    redirect('/admin/blog');
  }

  const title = formData.get('title') as string;
  const excerpt = formData.get('excerpt') as string;
  const content = formData.get('content') as string;
  const categoryRaw = formData.get('category') as string;
  const statusRaw = (formData.get('status') as string) || 'DRAFT';
  const publishDateRaw = formData.get('publishDate') as string;
  const featuredRaw = formData.get('featured') as string;

  const validation = createArticleSchema.safeParse({
    title,
    excerpt,
    content,
    category: categoryRaw,
    status: statusRaw,
  });

  if (!validation.success) {
    const message = encodeURIComponent(
      validation.error.errors[0]?.message ?? 'Invalid input',
    );
    redirect(`/admin/blog/new?error=${message}`);
  }

  const { status, category } = validation.data;

  if (status === 'SCHEDULED' && !publishDateRaw) {
    const message = encodeURIComponent(
      'Publish date is required for scheduled articles.',
    );
    redirect(`/admin/blog/new?error=${message}`);
  }

  let publishDate: Date | null = null;

  if (status === 'SCHEDULED' && publishDateRaw) {
    publishDate = new Date(publishDateRaw);
  }

  if (status === 'PUBLISHED') {
    publishDate = new Date();
  }

  const featured = featuredRaw === 'on';
  const slug = slugify(title);

  try {
    await prisma.blogArticle.create({
      data: {
        slug,
        title,
        content,
        excerpt,
        category,
        authorId: user.id,
        status: status as (typeof VALID_STATUSES)[number],
        featured,
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
      const retrySlug = slugify(title);
      try {
        await prisma.blogArticle.create({
          data: {
            slug: retrySlug,
            title,
            content,
            excerpt,
            category,
            authorId: user.id,
            status: status as (typeof VALID_STATUSES)[number],
            featured,
            publishDate,
          },
        });
      } catch (retryErr: unknown) {
        const message = encodeURIComponent(
          'Unable to create article. Please try again.',
        );
        redirect(`/admin/blog/new?error=${message}`);
      }
    } else {
      const message = encodeURIComponent(
        'Unable to create article. Please try again.',
      );
      redirect(`/admin/blog/new?error=${message}`);
    }
  }

  redirect('/admin/blog');
}

export async function updateArticleStatus(
  articleId: string,
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

  if (!VALID_STATUSES.includes(newStatus as (typeof VALID_STATUSES)[number])) {
    return;
  }

  const publishDate = newStatus === 'PUBLISHED' ? new Date() : undefined;

  try {
    await prisma.blogArticle.update({
      where: { id: articleId },
      data: {
        status: newStatus as (typeof VALID_STATUSES)[number],
        ...(publishDate !== undefined && { publishDate }),
      },
    });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      revalidatePath('/admin/blog');
      return;
    }
    revalidatePath('/admin/blog');
    return;
  }

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
}
