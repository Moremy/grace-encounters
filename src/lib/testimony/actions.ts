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
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

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
  const isAnonymous = formData.get('isAnonymous') === 'true';

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
    const message = encodeURIComponent(
      validation.error.errors[0]?.message ?? 'Invalid input',
    );
    redirect(`/testimonies/new?error=${message}`);
  }

  const tags = tagsRaw
    ? tagsRaw
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  const slug = slugify(title);

  const testimonyData = {
    slug,
    title,
    content,
    excerpt,
    authorId: user.id,
    status: 'PENDING' as const,
    featured: false,
    isAnonymous,
    mediaType: mediaType as 'TEXT' | 'PDF' | 'AUDIO' | 'VIDEO',
    mediaUrl: mediaUrl || null,
    thumbnailUrl: thumbnailUrl || null,
    category: category
      ? (category as
          | 'HEALING'
          | 'SALVATION'
          | 'DELIVERANCE'
          | 'PROVISION'
          | 'RESTORATION'
          | 'FAITH'
          | 'OTHER')
      : undefined,
    tags,
  };

  try {
    await prisma.testimony.create({
      data: testimonyData,
    });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      const retrySlug = `${slugify(title)}-${Date.now()}`;

      try {
        await prisma.testimony.create({
          data: {
            ...testimonyData,
            slug: retrySlug,
          },
        });
      } catch {
        const message = encodeURIComponent(
          'Unable to create testimony. Please try again.',
        );
        redirect(`/testimonies/new?error=${message}`);
      }
    } else {
      const message = encodeURIComponent(
        'Unable to create testimony. Please try again.',
      );
      redirect(`/testimonies/new?error=${message}`);
    }
  }

  revalidatePath('/testimonies/mine');
  revalidatePath('/admin/testimonies');

  redirect('/testimonies/mine');
}

/**
 * Update a testimony's moderation status.
 *
 * This action is invoked from `<form action={updateTestimonyStatus.bind(null,
 * id, status)}>` on the admin page. When Next.js runs a bound server action
 * inside a `<form>`, it appends a `FormData` object as the trailing
 * argument — so the third parameter here is the FormData payload, NOT a
 * plain string. We read an optional `revisionNote` field out of it (used
 * for "Request Revision"), and only accept a string.
 */
export async function updateTestimonyStatus(
  testimonyId: string,
  newStatus: string,
  formData?: FormData,
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

  // Pull a revision note out of the form payload if one was supplied.
  // Anything that isn't a non-empty string is treated as "no note".
  const rawNote = formData?.get('revisionNote');
  const revisionNote =
    typeof rawNote === 'string' && rawNote.trim().length > 0
      ? rawNote.trim()
      : null;

  const publishedAt =
    newStatus === 'APPROVED' || newStatus === 'FEATURED' ? new Date() : null;

  try {
    await prisma.testimony.update({
      where: { id: testimonyId },
      data: {
        status: newStatus as (typeof VALID_STATUSES)[number],
        revisionNote,
        publishedAt,
        featured: newStatus === 'FEATURED',
      },
    });
  } catch (err) {
    // Surface the failure in the server logs so we don't silently swallow
    // Prisma / DB errors the way the previous implementation did.
    console.error('[updateTestimonyStatus] update failed:', err);
    revalidatePath('/admin/testimonies');
    return;
  }

  revalidatePath('/admin/testimonies');
  revalidatePath('/admin/reviews');
  revalidatePath('/testimonies');
  // The homepage renders <FeaturedTestimony /> from the same data, so it
  // must be revalidated too — otherwise a moderator featuring a story
  // won't see it on `/` until the next deploy or hard refresh.
  revalidatePath('/');
}

// Filter used by every public-facing testimony query. Only stories
// explicitly featured by a moderator are visible to visitors — plain
// "APPROVED" stories stay private to the author and admins.
const PUBLIC_TESTIMONY_FILTER = {
  OR: [{ status: 'FEATURED' as const }, { featured: true }],
};

export async function getApprovedTestimonies() {
  return prisma.testimony.findMany({
    where: PUBLIC_TESTIMONY_FILTER,
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
      ...PUBLIC_TESTIMONY_FILTER,
    },
    include: {
      author: { select: { displayName: true } },
    },
  });
}

export async function getMyTestimonies() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  return prisma.testimony.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: 'desc' },
  });
}

const EDITABLE_STATUSES = ['PENDING', 'NEEDS_REVISION'] as const;

export async function getMyTestimonyBySlug(slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  return prisma.testimony.findFirst({
    where: { slug, authorId: user.id },
    include: {
      author: { select: { displayName: true } },
    },
  });
}

export async function updateMyTestimony(
  testimonyId: string,
  formData: FormData,
) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const existing = await prisma.testimony.findFirst({
    where: { id: testimonyId, authorId: user.id },
    select: { id: true, status: true },
  });

  // Not found, or not owned by the current user.
  if (!existing) {
    redirect('/testimonies/mine');
  }

  // Only pending or needs-revision testimonies may be edited.
  if (
    !EDITABLE_STATUSES.includes(
      existing.status as (typeof EDITABLE_STATUSES)[number],
    )
  ) {
    const message = encodeURIComponent(
      'Approved testimonies cannot be edited.',
    );
    redirect(`/testimonies/mine?error=${message}`);
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const displayName = ((formData.get('displayName') as string) || '').trim();

  const validation = createTestimonySchema
    .pick({ title: true, content: true })
    .safeParse({ title, content });

  if (!validation.success) {
    const message = encodeURIComponent(
      validation.error.errors[0]?.message ?? 'Invalid input',
    );
    redirect(`/testimonies/${testimonyId}/edit?error=${message}`);
  }

  try {
    await prisma.testimony.update({
      where: { id: testimonyId },
      data: { title, content },
    });

    await prisma.profile.update({
      where: { id: user.id },
      data: { displayName: displayName || null },
    });
  } catch {
    const message = encodeURIComponent(
      'Unable to update testimony. Please try again.',
    );
    redirect(`/testimonies/${testimonyId}/edit?error=${message}`);
  }

  revalidatePath('/testimonies/mine');
  revalidatePath('/admin/testimonies');

  redirect('/testimonies/mine');
}

export async function getPendingTestimonies() {
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
      ...PUBLIC_TESTIMONY_FILTER,
      category: category as
        | 'HEALING'
        | 'SALVATION'
        | 'DELIVERANCE'
        | 'PROVISION'
        | 'RESTORATION'
        | 'FAITH'
        | 'OTHER',
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
      ...PUBLIC_TESTIMONY_FILTER,
      title: { contains: query, mode: 'insensitive' },
    },
    include: {
      author: { select: { displayName: true } },
    },
    orderBy: { publishedAt: 'desc' },
  });
}

export async function getFilteredTestimonies(
  category?: string,
  mediaType?: string,
) {
  const where: Record<string, unknown> = { ...PUBLIC_TESTIMONY_FILTER };

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