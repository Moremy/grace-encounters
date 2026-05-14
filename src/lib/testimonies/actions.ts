'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth/require-role';
import { testimonySubmissionSchema, type TestimonySubmissionInput } from './schema';

type ActionResult<T = unknown> = { ok: true; data?: T } | { ok: false; error: string };

export async function submitTestimony(input: TestimonySubmissionInput): Promise<ActionResult<{ id: string }>> {
  const profile = await requireUser();
  const parsed = testimonySubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid submission.' };
  }
  const created = await prisma.testimony.create({
    data: {
      authorId: profile.id,
      title: parsed.data.title,
      category: parsed.data.category,
      body: parsed.data.body,
      scriptureRefs: parsed.data.scriptureRefs ?? [],
      coverImageUrl: parsed.data.coverImageUrl ?? null,
      isAnonymous: parsed.data.isAnonymous,
      status: 'submitted',
      isPublished: false,
      isFeatured: false,
    },
    select: { id: true },
  });
  revalidatePath('/testimonies/mine');
  return { ok: true, data: { id: created.id } };
}

export async function withdrawTestimony(id: string): Promise<ActionResult> {
  const profile = await requireUser();
  const existing = await prisma.testimony.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: 'Testimony not found.' };
  if (existing.authorId !== profile.id) return { ok: false, error: 'Not your testimony.' };
  if (!['submitted', 'in_review', 'needs_revision'].includes(existing.status)) {
    return { ok: false, error: 'Only pending testimonies can be withdrawn.' };
  }
  // Withdraw policy: while still 'submitted' or 'in_review' or 'needs_revision', the row is removed.
  // Drafts use the dedicated edit/save flow; published testimonies are managed by moderators.
  await prisma.testimony.delete({ where: { id } });
  revalidatePath('/testimonies/mine');
  return { ok: true };
}

export async function resubmitTestimony(id: string, input: TestimonySubmissionInput): Promise<ActionResult> {
  const profile = await requireUser();
  const existing = await prisma.testimony.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: 'Testimony not found.' };
  if (existing.authorId !== profile.id) return { ok: false, error: 'Not your testimony.' };
  if (existing.status !== 'needs_revision') {
    return { ok: false, error: 'Only testimonies marked needs_revision can be resubmitted.' };
  }
  const parsed = testimonySubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid submission.' };
  }
  await prisma.testimony.update({
    where: { id },
    data: {
      title: parsed.data.title,
      category: parsed.data.category,
      body: parsed.data.body,
      scriptureRefs: parsed.data.scriptureRefs ?? [],
      coverImageUrl: parsed.data.coverImageUrl ?? null,
      isAnonymous: parsed.data.isAnonymous,
      status: 'submitted',
      reviewNote: null,
    },
  });
  revalidatePath('/testimonies/mine');
  return { ok: true };
}
