'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canModerate, fromPrismaRole } from '@/lib/auth/roles';
import { validateUpload } from '@/lib/upload/config';

const BOOKS_BUCKET = 'books';

const VALID_STATUSES = ['DRAFT', 'PUBLISHED'] as const;

const createBookSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title must be at most 200 characters'),
  author: z
    .string()
    .min(2, 'Author must be at least 2 characters')
    .max(120, 'Author must be at most 120 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be at most 1000 characters'),
  externalUrl: z
    .string()
    .url('External link must be a valid URL')
    .optional()
    .or(z.literal('')),
  status: z.enum(VALID_STATUSES).default('PUBLISHED'),
});

async function requireModerator() {
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

  return { supabase, user };
}

function isRealFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0 && value.name !== '';
}

export async function createBook(formData: FormData) {
  const { supabase, user } = await requireModerator();

  const title = formData.get('title') as string;
  const author = formData.get('author') as string;
  const description = formData.get('description') as string;
  const externalUrl = (formData.get('externalUrl') as string) || '';
  const statusRaw = (formData.get('status') as string) || 'PUBLISHED';

  const validation = createBookSchema.safeParse({
    title,
    author,
    description,
    externalUrl,
    status: statusRaw,
  });

  if (!validation.success) {
    const message = encodeURIComponent(
      validation.error.errors[0]?.message ?? 'Invalid input',
    );
    redirect(`/admin/books/new?error=${message}`);
  }

  let fileUrl: string | null = null;
  const file = formData.get('file');

  if (isRealFile(file)) {
    const check = validateUpload(file, 'pdf');
    if (!check.valid) {
      redirect(`/admin/books/new?error=${encodeURIComponent(check.error ?? 'Invalid file')}`);
    }

    const safeName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]+/g, '-')
      .slice(0, 60);
    const storagePath = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}-${safeName}.pdf`;

    const { data, error } = await supabase.storage
      .from(BOOKS_BUCKET)
      .upload(storagePath, file, { contentType: 'application/pdf', upsert: false });

    if (error) {
      redirect(
        `/admin/books/new?error=${encodeURIComponent('Book file upload failed. Please try again.')}`,
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BOOKS_BUCKET).getPublicUrl(data.path);
    fileUrl = publicUrl;
  }

  try {
    await prisma.book.create({
      data: {
        title,
        author,
        description,
        fileUrl,
        externalUrl: validation.data.externalUrl || null,
        status: validation.data.status,
        createdById: user.id,
      },
    });
  } catch (e) {
    console.error('createBook error:', e);
    redirect(
      `/admin/books/new?error=${encodeURIComponent('Unable to create book. Please try again.')}`,
    );
  }

  revalidatePath('/admin/books');
  revalidatePath('/books');
  redirect('/admin/books');
}

export async function updateBookStatus(bookId: string, newStatus: string) {
  await requireModerator();

  if (!VALID_STATUSES.includes(newStatus as (typeof VALID_STATUSES)[number])) {
    return;
  }

  try {
    await prisma.book.update({
      where: { id: bookId },
      data: { status: newStatus as (typeof VALID_STATUSES)[number] },
    });
  } catch {
    // Record not found — fall through to revalidate below.
  }

  revalidatePath('/admin/books');
  revalidatePath('/books');
}

export async function deleteBook(bookId: string) {
  await requireModerator();

  try {
    await prisma.book.delete({ where: { id: bookId } });
  } catch {
    // Record not found — fall through to revalidate below.
  }

  revalidatePath('/admin/books');
  revalidatePath('/books');
}

export async function getPublishedBooks() {
  return prisma.book.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllBooksAdmin() {
  await requireModerator();

  return prisma.book.findMany({ orderBy: { createdAt: 'desc' } });
}
