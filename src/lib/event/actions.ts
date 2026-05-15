'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canModerate, fromPrismaRole } from '@/lib/auth/roles';
import { slugify } from './utils';

const VALID_STATUSES = ['DRAFT', 'PUBLISHED', 'CANCELLED'] as const;

const createEventSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters'),
  location: z
    .string()
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location must be at most 200 characters'),
  date: z.string().min(1, 'Date is required'),
  endDate: z.string().optional(),
  status: z.enum(VALID_STATUSES).default('DRAFT'),
  featured: z.boolean().default(false),
});

// ---------------------------------------------------------------------------
// Public actions
// ---------------------------------------------------------------------------

export async function getUpcomingEvents() {
  return prisma.event.findMany({
    where: {
      status: 'PUBLISHED',
      date: { gte: new Date() },
    },
    include: {
      createdBy: { select: { displayName: true } },
    },
    orderBy: { date: 'asc' },
    take: 50,
  });
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findFirst({
    where: {
      slug,
      status: 'PUBLISHED',
    },
    include: {
      createdBy: { select: { displayName: true } },
    },
  });
}

// ---------------------------------------------------------------------------
// Admin actions
// ---------------------------------------------------------------------------

export async function getAllEventsAdmin() {
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

  return prisma.event.findMany({
    include: {
      createdBy: { select: { displayName: true } },
    },
    orderBy: { date: 'desc' },
  });
}

export async function createEvent(formData: FormData) {
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
    redirect('/admin/events');
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const location = formData.get('location') as string;
  const dateRaw = formData.get('date') as string;
  const endDateRaw = formData.get('endDate') as string;
  const statusRaw = (formData.get('status') as string) || 'DRAFT';
  const featured = formData.get('featured') === 'on';

  const validation = createEventSchema.safeParse({
    title,
    description,
    location,
    date: dateRaw,
    endDate: endDateRaw || undefined,
    status: statusRaw,
    featured,
  });

  if (!validation.success) {
    const message = encodeURIComponent(
      validation.error.errors[0]?.message ?? 'Invalid input',
    );
    redirect(`/admin/events/new?error=${message}`);
  }

  const { status } = validation.data;
  const slug = slugify(title);
  const date = new Date(dateRaw);
  const endDate = endDateRaw ? new Date(endDateRaw) : null;

  try {
    await prisma.event.create({
      data: {
        slug,
        title,
        description,
        location,
        date,
        endDate,
        featured,
        status: status as (typeof VALID_STATUSES)[number],
        createdById: user.id,
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
        await prisma.event.create({
          data: {
            slug: retrySlug,
            title,
            description,
            location,
            date,
            endDate,
            featured,
            status: status as (typeof VALID_STATUSES)[number],
            createdById: user.id,
          },
        });
      } catch {
        const message = encodeURIComponent(
          'Unable to create event. Please try again.',
        );
        redirect(`/admin/events/new?error=${message}`);
      }
    } else {
      const message = encodeURIComponent(
        'Unable to create event. Please try again.',
      );
      redirect(`/admin/events/new?error=${message}`);
    }
  }

  redirect('/admin/events');
}

export async function updateEventStatus(eventId: string, newStatus: string) {
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

  try {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        status: newStatus as (typeof VALID_STATUSES)[number],
      },
    });
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code === 'P2025'
    ) {
      revalidatePath('/admin/events');
      return;
    }
    revalidatePath('/admin/events');
    return;
  }

  revalidatePath('/admin/events');
  revalidatePath('/events');
}
