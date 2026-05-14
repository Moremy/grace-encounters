'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/require-role';
import { slugifyTitle } from './slug';

type ActionResult<T = unknown> = { ok: true; data?: T } | { ok: false; error: string };

// Prisma's Json field is typed as `Prisma.InputJsonValue` which is awkward to
// satisfy from a `Record<string, unknown>`. The `as never` cast below is
// intentional and documented; the value is always JSON-serializable.
async function writeAudit(actorId: string, action: string, targetId: string, metadata: Record<string, unknown> = {}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      targetType: 'testimony',
      targetId,
      metadata: metadata as never,
    },
  });
}

async function uniqueSlugFor(title: string, excludeId?: string): Promise<string> {
  const base = slugifyTitle(title) || 'testimony';
  let candidate = base;
  let suffix = 2;
  // Linear-probe slug collisions; in practice approve-volume is moderator-paced so this is fine.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const clash = await prisma.testimony.findFirst({
      where: { slug: candidate, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      select: { id: true },
    });
    if (!clash) return candidate;
    candidate = `${base}-${suffix++}`.slice(0, 80);
  }
}

export async function approveTestimony(id: string, opts: { feature?: boolean } = {}): Promise<ActionResult> {
  const moderator = await requireRole('moderator');
  const existing = await prisma.testimony.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: 'Testimony not found.' };
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
        // Prisma Json input: see writeAudit note. JSON-serializable record cast to `never`.
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
      // Prisma Json input: see writeAudit note. JSON-serializable record cast to `never`.
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
      // Prisma Json input: see writeAudit note. JSON-serializable record cast to `never`.
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
      // Prisma Json input: see writeAudit note. JSON-serializable record cast to `never`.
      data: { actorId: moderator.id, action: on ? 'testimony.feature' : 'testimony.unfeature', targetType: 'testimony', targetId: id, metadata: {} as never },
    }),
  ]);
  revalidatePath('/');
  revalidatePath('/admin/testimonies');
  return { ok: true };
}
