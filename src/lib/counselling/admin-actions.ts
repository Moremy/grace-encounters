'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { CounsellingStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { canAdmin, fromPrismaRole } from '@/lib/auth/roles';

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true, role: true },
  });

  const role = fromPrismaRole(profile?.role ?? null);

  if (!profile || !canAdmin(role)) {
    redirect('/dashboard');
  }

  return profile;
}

async function updateCounsellingRequest(
  requestId: string,
  data: {
    status?: CounsellingStatus;
    assignedTo?: string | null;
    adminNotes?: string | null;
    contactedAt?: Date | null;
    closedAt?: Date | null;
  },
) {
  await requireAdmin();

  if (!requestId) {
    redirect('/admin/counselling');
  }

  await prisma.counsellingRequest.update({
    where: { id: requestId },
    data,
  });

  revalidatePath('/admin/counselling');
  revalidatePath(`/admin/counselling/${requestId}`);
  revalidatePath('/dashboard/counselling');
}

export async function assignCounsellingRequest(formData: FormData) {
  const requestId = String(formData.get('requestId') || '');
  const assignedTo = String(formData.get('assignedTo') || '').trim();

  await updateCounsellingRequest(requestId, {
    assignedTo: assignedTo || null,
    status: assignedTo ? 'ASSIGNED' : 'PENDING',
  });
}

export async function saveCounsellingAdminNotes(formData: FormData) {
  const requestId = String(formData.get('requestId') || '');
  const adminNotes = String(formData.get('adminNotes') || '').trim();

  await updateCounsellingRequest(requestId, {
    adminNotes: adminNotes || null,
  });
}

export async function markCounsellingContacted(formData: FormData) {
  const requestId = String(formData.get('requestId') || '');

  await updateCounsellingRequest(requestId, {
    status: 'CONTACTED',
    contactedAt: new Date(),
  });
}

export async function markCounsellingInProgress(formData: FormData) {
  const requestId = String(formData.get('requestId') || '');

  await updateCounsellingRequest(requestId, {
    status: 'IN_PROGRESS',
  });
}

export async function closeCounsellingRequest(formData: FormData) {
  const requestId = String(formData.get('requestId') || '');

  await updateCounsellingRequest(requestId, {
    status: 'CLOSED',
    closedAt: new Date(),
  });
}
