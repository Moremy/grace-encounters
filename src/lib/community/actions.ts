'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canModerate, fromPrismaRole } from '@/lib/auth/roles';
import { slugify } from './utils';

const VALID_CATEGORIES = [
  'PRAYER',
  'BIBLE_STUDY',
  'WORSHIP',
  'FELLOWSHIP',
  'OUTREACH',
  'YOUTH',
  'WOMEN',
  'MEN',
] as const;

const createGroupSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be at most 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be at most 1000 characters'),
  category: z.enum(VALID_CATEGORIES, {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
});

const createDiscussionSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be at most 200 characters'),
  content: z
    .string()
    .min(10, 'Content must be at least 10 characters')
    .max(5000, 'Content must be at most 5000 characters'),
  groupId: z.string().min(1, 'Group is required'),
  isPrayerThread: z.boolean().default(false),
});

const createReplySchema = z.object({
  content: z
    .string()
    .min(3, 'Reply must be at least 3 characters')
    .max(5000, 'Reply must be at most 5000 characters'),
  discussionId: z.string().min(1, 'Discussion is required'),
});

// ---------------------------------------------------------------------------
// Public actions
// ---------------------------------------------------------------------------

export async function getPublishedGroups() {
  return prisma.communityGroup.findMany({
    orderBy: { memberCount: 'desc' },
    include: {
      _count: { select: { members: true } },
    },
  });
}

export async function getGroupBySlug(slug: string) {
  return prisma.communityGroup.findUnique({
    where: { slug },
    include: {
      _count: { select: { members: true } },
      discussions: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { displayName: true } },
          _count: { select: { replies: true } },
        },
      },
    },
  });
}

export async function getGroupDiscussions(groupId: string) {
  return prisma.groupDiscussion.findMany({
    where: { groupId },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { displayName: true } },
      _count: { select: { replies: true } },
    },
  });
}

// ---------------------------------------------------------------------------
// Authenticated user actions
// ---------------------------------------------------------------------------

export async function isGroupMember(groupId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return false;
  }

  const member = await prisma.communityGroupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: user.id,
      },
    },
  });

  return !!member;
}

export async function joinGroup(groupId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  // Check if already a member
  const existing = await prisma.communityGroupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: user.id,
      },
    },
  });

  if (existing) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.communityGroupMember.create({
      data: {
        groupId,
        userId: user.id,
      },
    });

    await tx.communityGroup.update({
      where: { id: groupId },
      data: { memberCount: { increment: 1 } },
    });
  });

  revalidatePath('/community');
}

export async function leaveGroup(groupId: string) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const existing = await prisma.communityGroupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId: user.id,
      },
    },
  });

  if (!existing) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.communityGroupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId: user.id,
        },
      },
    });

    await tx.communityGroup.update({
      where: { id: groupId },
      data: { memberCount: { decrement: 1 } },
    });
  });

  revalidatePath('/community');
}

export async function createDiscussion(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const groupId = formData.get('groupId') as string;
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const isPrayerThread = formData.get('isPrayerThread') === 'on';

  const validation = createDiscussionSchema.safeParse({
    title,
    content,
    groupId,
    isPrayerThread,
  });

  if (!validation.success) {
    const message = encodeURIComponent(
      validation.error.errors[0]?.message ?? 'Invalid input',
    );
    redirect(`/community?error=${message}`);
  }

  // Verify the group exists
  const group = await prisma.communityGroup.findUnique({
    where: { id: groupId },
    select: { slug: true },
  });

  if (!group) {
    redirect('/community');
  }

  try {
    await prisma.groupDiscussion.create({
      data: {
        groupId,
        authorId: user.id,
        title,
        content,
        isPrayerThread,
      },
    });
  } catch {
    const message = encodeURIComponent(
      'Unable to create discussion. Please try again.',
    );
    redirect(`/community/${group.slug}?error=${message}`);
  }

  revalidatePath(`/community/${group.slug}`);
  redirect(`/community/${group.slug}`);
}

export async function createDiscussionReply(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const discussionId = formData.get('discussionId') as string;
  const content = formData.get('content') as string;

  const validation = createReplySchema.safeParse({ content, discussionId });

  if (!validation.success) {
    const message = encodeURIComponent(
      validation.error.errors[0]?.message ?? 'Invalid input',
    );
    redirect(`/community?error=${message}`);
  }

  try {
    await prisma.groupDiscussionReply.create({
      data: {
        discussionId,
        authorId: user.id,
        content,
      },
    });
  } catch {
    return;
  }

  revalidatePath('/community');
}

// ---------------------------------------------------------------------------
// Admin actions
// ---------------------------------------------------------------------------

export async function createGroup(formData: FormData) {
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
    redirect('/admin/community');
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;

  const validation = createGroupSchema.safeParse({
    name,
    description,
    category,
  });

  if (!validation.success) {
    const message = encodeURIComponent(
      validation.error.errors[0]?.message ?? 'Invalid input',
    );
    redirect(`/admin/community/new?error=${message}`);
  }

  const slug = slugify(name);

  try {
    await prisma.communityGroup.create({
      data: {
        slug,
        name,
        description,
        category: validation.data.category,
      },
    });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      const retrySlug = slugify(name);
      try {
        await prisma.communityGroup.create({
          data: {
            slug: retrySlug,
            name,
            description,
            category: validation.data.category,
          },
        });
      } catch {
        const message = encodeURIComponent(
          'Unable to create group. Please try again.',
        );
        redirect(`/admin/community/new?error=${message}`);
      }
    } else {
      const message = encodeURIComponent(
        'Unable to create group. Please try again.',
      );
      redirect(`/admin/community/new?error=${message}`);
    }
  }

  redirect('/admin/community');
}

export async function getAllGroupsAdmin() {
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

  return prisma.communityGroup.findMany({
    include: {
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
