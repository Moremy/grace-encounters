'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/require-role';
import { slugifyTitle } from './slug';

type ActionResult<T = unknown> = { ok: true; data?: T } | { ok: false; error: string };

async function uniqueSlugFor(title: string, excludeId?: string): Promise<string> {
  // slugifyTitle already clamps to 80 chars; clamp defensively in case that ever changes.
  const base = (slugifyTitle(title) || 'testimony').slice(0, 80);
  let candidate = base;
  let suffix = 2;
  // Linear-probe slug collisions; in practice approve-volume is moderator-paced so this is fine.
  // Budget the suffix length BEFORE slicing the base, otherwise an 80-char base
  // produces a candidate identical to the base after `.slice(0, 80)` and the
  // loop never terminates.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const clash = await prisma.testimony.findFirst({
      where: { slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    if (!clash) return candidate;
    const suffixStr = `-${suffix++}`;
    candidate = `${base.slice(0, 80 - suffixStr.length)}${suffixStr}`;
  }
}

export async function approveTestimony(id: string, opts: { feature?: boolean } = {}): Promise<ActionResult> {
  const moderator = await requireRole('moderator');
  const existing = await prisma.testimony.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: 'Testimony not found.' };
  if (existing.status === 'rejected') {
    return { ok: false, error: 'Rejected testimonies cannot be re-approved directly. Ask the author to resubmit.' };
  }
  // NOTE: slug uniqueness is racy under concurrent approve. Two moderators approving same-titled testimonies simultaneously will collide on the second update; the rare retry is acceptable for moderator-paced volume.
  const slug = existing.slug ?? (await uniqueSlugFor(existing.title, existing.id));
  await prisma.$transaction([
    prisma.testimony.update({
      where: { id },
      data: {
        status: 'approved',
        isPublished: true,
        publishedAt: existing.publishedAt ?? new Date(),
        slug,
        isFeatured: opts.feature ?? existing.isFeatured,
        reviewedById: moderator.id,
        reviewedAt: new Date(),
      },
    }),
    prisma.auditLog.create({
      data: {
        actorId: moderator.id,
        action: 'testimony.approve',
        targetType: 'testimony',
        targetId: id,
        // Prisma Json input: cast to `never` to satisfy `Prisma.InputJsonValue`. JSON-serializable.
        metadata: { feature: opts.feature ?? false } as never,
      },
    }),
  ]);
  revalidatePath('/');
  revalidatePath('/admin/testimonies');
  return { ok: true };
}

export async function requestRevision(id: string, note: string): Promise<ActionResult> {
  const moderator = await requireRole('moderator');
  if (!note.trim()) return { ok: false, error: 'A revision note is required.' };
  await prisma.$transaction([
    prisma.testimony.update({
      where: { id },
      data: { status: 'needs_revision', reviewNote: note, reviewedById: moderator.id, reviewedAt: new Date() },
    }),
    prisma.auditLog.create({
      // Prisma Json input: cast to `never` to satisfy `Prisma.InputJsonValue`. JSON-serializable.
      data: { actorId: moderator.id, action: 'testimony.request_revision', targetType: 'testimony', targetId: id, metadata: { note } as never },
    }),
  ]);
  revalidatePath('/admin/testimonies');
  return { ok: true };
}

export async function rejectTestimony(id: string, reason: string): Promise<ActionResult> {
  const moderator = await requireRole('moderator');
  if (!reason.trim()) return { ok: false, error: 'A reason is required.' };
  await prisma.$transaction([
    prisma.testimony.update({
      where: { id },
      data: { status: 'rejected', isPublished: false, reviewNote: reason, reviewedById: moderator.id, reviewedAt: new Date() },
    }),
    prisma.auditLog.create({
      // Prisma Json input: cast to `never` to satisfy `Prisma.InputJsonValue`. JSON-serializable.
      data: { actorId: moderator.id, action: 'testimony.reject', targetType: 'testimony', targetId: id, metadata: { reason } as never },
    }),
  ]);
  revalidatePath('/admin/testimonies');
  return { ok: true };
}

export async function featureTestimony(id: string, on: boolean): Promise<ActionResult> {
  const moderator = await requireRole('moderator');
  const existing = await prisma.testimony.findUnique({ where: { id }, select: { status: true, isPublished: true } });
  if (!existing) return { ok: false, error: 'Testimony not found.' };
  if (on && !(existing.status === 'approved' && existing.isPublished)) {
    return { ok: false, error: 'Only approved + published testimonies can be featured.' };
  }
  await prisma.$transaction([
    prisma.testimony.update({ where: { id }, data: { isFeatured: on } }),
    prisma.auditLog.create({
      // Prisma Json input: cast to `never` to satisfy `Prisma.InputJsonValue`. JSON-serializable.
      data: { actorId: moderator.id, action: on ? 'testimony.feature' : 'testimony.unfeature', targetType: 'testimony', targetId: id, metadata: {} as never },
    }),
  ]);
  revalidatePath('/');
  revalidatePath('/admin/testimonies');
  return { ok: true };
}
