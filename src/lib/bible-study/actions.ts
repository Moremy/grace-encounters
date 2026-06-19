'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canAdmin, fromPrismaRole } from '@/lib/auth/roles';
import { slugify } from './utils';

const createPlanSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be at most 2000 characters'),
  totalDays: z.coerce.number().int().min(1).max(365),
  coverImageUrl: z.string().optional(),
});

const addDaySchema = z.object({
  planId: z.string().min(1),
  dayNumber: z.coerce.number().int().min(1),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),
  scripture: z.string().min(1, 'Scripture text is required'),
  scriptureReference: z
    .string()
    .min(1, 'Scripture reference is required')
    .max(200),
  reflection: z.string().optional(),
});

export async function getReadingPlans() {
  return prisma.bibleStudyPlan.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPlanBySlug(slug: string) {
  return prisma.bibleStudyPlan.findUnique({
    where: { slug },
    include: {
      days: { orderBy: { dayNumber: 'asc' } },
    },
  });
}

export async function getPlanDays(planId: string) {
  return prisma.bibleStudyDay.findMany({
    where: { planId },
    orderBy: { dayNumber: 'asc' },
  });
}

export async function getUserProgress(planId: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  return prisma.bibleStudyProgress.findMany({
    where: {
      planId,
      userId: user.id,
    },
    orderBy: { dayNumber: 'asc' },
  });
}

export async function markDayComplete(planId: string, dayNumber: number) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const existing = await prisma.bibleStudyProgress.findFirst({
    where: {
      planId,
      userId: user.id,
      dayNumber,
    },
  });

  if (existing) {
    await prisma.bibleStudyProgress.update({
      where: { id: existing.id },
      data: { completed: true, completedAt: new Date() },
    });
  } else {
    await prisma.bibleStudyProgress.create({
      data: {
        planId,
        userId: user.id,
        dayNumber,
        completed: true,
        completedAt: new Date(),
      },
    });
  }

  revalidatePath('/dashboard/bible-study');
}

export async function saveReflectionNote(
  planId: string,
  dayNumber: number,
  notes: string,
) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const existing = await prisma.bibleStudyProgress.findFirst({
    where: {
      planId,
      userId: user.id,
      dayNumber,
    },
  });

  if (existing) {
    await prisma.bibleStudyProgress.update({
      where: { id: existing.id },
      data: { notes },
    });
  } else {
    await prisma.bibleStudyProgress.create({
      data: {
        planId,
        userId: user.id,
        dayNumber,
        notes,
      },
    });
  }

  revalidatePath('/dashboard/bible-study');
}

export async function getMyBookmarks() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  return prisma.scriptureBookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addBookmark(
  reference: string,
  content?: string,
  note?: string,
) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  if (!reference || reference.trim().length === 0) {
    return;
  }

  await prisma.scriptureBookmark.create({
    data: {
      userId: user.id,
      reference: reference.trim(),
      content: content?.trim() || null,
      note: note?.trim() || null,
    },
  });

  revalidatePath('/dashboard/bible-study/bookmarks');
}

export async function removeBookmark(bookmarkId: string) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  // Verify ownership before deleting
  const bookmark = await prisma.scriptureBookmark.findFirst({
    where: { id: bookmarkId, userId: user.id },
  });

  if (!bookmark) return;

  await prisma.scriptureBookmark.delete({
    where: { id: bookmarkId },
  });

  revalidatePath('/dashboard/bible-study/bookmarks');
}

export async function getUserStudyStats() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const [progressEntries, bookmarks] = await Promise.all([
    prisma.bibleStudyProgress.findMany({
      where: { userId: user.id },
      select: { planId: true, completed: true, completedAt: true },
    }),
    prisma.scriptureBookmark.count({
      where: { userId: user.id },
    }),
  ]);

  const plansStarted = new Set(progressEntries.map((p) => p.planId)).size;
  const daysCompleted = progressEntries.filter((p) => p.completed).length;

  // Calculate streak: consecutive days with completions ending today/yesterday
  const completedDates = progressEntries
    .filter((p) => p.completed && p.completedAt)
    .map((p) => {
      const d = new Date(p.completedAt!);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    });

  const uniqueDates = [...new Set(completedDates)].sort().reverse();
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < uniqueDates.length; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
    if (uniqueDates.includes(key)) {
      streak++;
    } else {
      break;
    }
  }

  return {
    plansStarted,
    daysCompleted,
    bookmarksCount: bookmarks,
    currentStreak: streak,
  };
}

export async function createReadingPlan(formData: FormData) {
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

  if (!canAdmin(role)) {
    redirect('/dashboard');
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const totalDays = formData.get('totalDays') as string;
  const coverImageUrl = formData.get('coverImageUrl') as string;

  const validation = createPlanSchema.safeParse({
    title,
    description,
    totalDays: totalDays ? Number(totalDays) : undefined,
    coverImageUrl: coverImageUrl || undefined,
  });

  if (!validation.success) {
    const message = encodeURIComponent(
      validation.error.errors[0]?.message ?? 'Invalid input',
    );
    redirect(`/admin/bible-study?error=${message}`);
  }

  const slug = slugify(validation.data.title);

  try {
    await prisma.bibleStudyPlan.create({
      data: {
        slug,
        title: validation.data.title,
        description: validation.data.description,
        totalDays: validation.data.totalDays,
        coverImageUrl: validation.data.coverImageUrl || null,
        createdById: user.id,
      },
    });
  } catch {
    const message = encodeURIComponent(
      'Unable to create reading plan. Please try again.',
    );
    redirect(`/admin/bible-study?error=${message}`);
  }

  revalidatePath('/admin/bible-study');
  revalidatePath('/bible-study');
  revalidatePath('/dashboard/bible-study');
  redirect('/admin/bible-study');
}

export async function addPlanDay(formData: FormData) {
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

  if (!canAdmin(role)) {
    redirect('/dashboard');
  }

  const planId = formData.get('planId') as string;
  const dayNumber = formData.get('dayNumber') as string;
  const title = formData.get('title') as string;
  const scripture = formData.get('scripture') as string;
  const scriptureReference = formData.get('scriptureReference') as string;
  const reflection = formData.get('reflection') as string;

  const validation = addDaySchema.safeParse({
    planId,
    dayNumber: dayNumber ? Number(dayNumber) : undefined,
    title,
    scripture,
    scriptureReference,
    reflection: reflection || undefined,
  });

  if (!validation.success) {
    const message = encodeURIComponent(
      validation.error.errors[0]?.message ?? 'Invalid input',
    );
    redirect(`/admin/bible-study?error=${message}`);
  }

  // Look up the plan slug so we can redirect the admin back to the page they
  // submitted from instead of dumping them at the dashboard.
  const plan = await prisma.bibleStudyPlan.findUnique({
    where: { id: validation.data.planId },
    select: { slug: true },
  });

  try {
    await prisma.bibleStudyDay.create({
      data: {
        planId: validation.data.planId,
        dayNumber: validation.data.dayNumber,
        title: validation.data.title,
        scripture: validation.data.scripture,
        scriptureReference: validation.data.scriptureReference,
        reflection: validation.data.reflection || null,
      },
    });
  } catch {
    const message = encodeURIComponent(
      'Unable to add day. Please try again.',
    );
    redirect(
      plan
        ? `/admin/bible-study/${plan.slug}?error=${message}`
        : `/admin/bible-study?error=${message}`,
    );
  }

  revalidatePath('/admin/bible-study');
  revalidatePath('/bible-study');
  revalidatePath('/dashboard/bible-study');
  if (plan) {
    revalidatePath(`/admin/bible-study/${plan.slug}`);
    revalidatePath(`/bible-study/${plan.slug}`);
    revalidatePath(`/dashboard/bible-study/plans/${plan.slug}`);
    redirect(`/admin/bible-study/${plan.slug}`);
  }
  redirect('/admin/bible-study');
}
