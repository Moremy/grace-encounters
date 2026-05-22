'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { FundraiserStatus } from '@prisma/client';

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

function getStatusFlags(newStatus: FundraiserStatus) {
  switch (newStatus) {
    case 'APPROVED':
      return {
        verified: true,
        published: false,
        suspiciousFlag: false,
        approvedAt: new Date(),
        publishedAt: null,
        rejectedAt: null,
        suspendedAt: null,
        closedAt: null,
      };

    case 'PUBLISHED':
      return {
        verified: true,
        published: true,
        suspiciousFlag: false,
        publishedAt: new Date(),
        rejectedAt: null,
        suspendedAt: null,
        closedAt: null,
      };

    case 'REJECTED':
      return {
        verified: false,
        published: false,
        suspiciousFlag: false,
        rejectedAt: new Date(),
      };

    case 'SUSPENDED':
      return {
        published: false,
        suspiciousFlag: true,
        suspendedAt: new Date(),
      };

    case 'CLOSED':
      return {
        published: false,
        closedAt: new Date(),
      };

    case 'UNDER_REVIEW':
    case 'TREASURY_REVIEW':
    case 'MORE_INFO_REQUIRED':
    case 'SUBMITTED':
    case 'DRAFT':
    default:
      return {
        verified: false,
        published: false,
        suspiciousFlag: false,
      };
  }
}

async function updateFundraiserStatus(
  fundraiserId: string,
  newStatus: FundraiserStatus,
  action: string,
) {
  const admin = await requireAdmin();

  if (!fundraiserId) {
    redirect('/admin/fundraisers');
  }

  const currentFundraiser = await prisma.fundraiser.findUnique({
    where: { id: fundraiserId },
    select: { status: true },
  });

  if (!currentFundraiser) {
    redirect('/admin/fundraisers');
  }

  await prisma.fundraiser.update({
    where: { id: fundraiserId },
    data: {
      status: newStatus,
      ...getStatusFlags(newStatus),
      auditLogs: {
        create: {
          actorId: admin.id,
          action,
          oldStatus: currentFundraiser.status,
          newStatus,
          notes: `Fundraiser moved to ${newStatus}.`,
        },
      },
    },
  });

  revalidatePath('/admin/fundraisers');
  revalidatePath(`/admin/fundraisers/${fundraiserId}`);
  revalidatePath('/dashboard/fundraisers');
  revalidatePath('/fundraisers');

  redirect(`/admin/fundraisers/${fundraiserId}`);
}

export async function markFundraiserUnderReview(formData: FormData) {
  const fundraiserId = String(formData.get('fundraiserId') || '');

  await updateFundraiserStatus(fundraiserId, 'UNDER_REVIEW', 'MARKED_UNDER_REVIEW');
}

export async function sendFundraiserToTreasury(formData: FormData) {
  const fundraiserId = String(formData.get('fundraiserId') || '');

  await updateFundraiserStatus(fundraiserId, 'TREASURY_REVIEW', 'SENT_TO_TREASURY_REVIEW');
}

export async function approveFundraiser(formData: FormData) {
  const fundraiserId = String(formData.get('fundraiserId') || '');

  await updateFundraiserStatus(fundraiserId, 'APPROVED', 'APPROVED');
}

export async function publishFundraiser(formData: FormData) {
  const fundraiserId = String(formData.get('fundraiserId') || '');

  await updateFundraiserStatus(fundraiserId, 'PUBLISHED', 'PUBLISHED');
}

export async function rejectFundraiser(formData: FormData) {
  const fundraiserId = String(formData.get('fundraiserId') || '');

  await updateFundraiserStatus(fundraiserId, 'REJECTED', 'REJECTED');
}

export async function suspendFundraiser(formData: FormData) {
  const fundraiserId = String(formData.get('fundraiserId') || '');

  await updateFundraiserStatus(fundraiserId, 'SUSPENDED', 'SUSPENDED');
}

export async function closeFundraiser(formData: FormData) {
  const fundraiserId = String(formData.get('fundraiserId') || '');

  await updateFundraiserStatus(fundraiserId, 'CLOSED', 'CLOSED');
}

export async function approvePaymentChannel(formData: FormData) {
  const admin = await requireAdmin();

  const channelId = String(formData.get('channelId') || '');
  const fundraiserId = String(formData.get('fundraiserId') || '');

  if (!channelId || !fundraiserId) {
    redirect('/admin/fundraisers');
  }

  await prisma.fundraiserPaymentChannel.update({
    where: { id: channelId },
    data: {
      isApproved: true,
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });

  await prisma.fundraiserAuditLog.create({
    data: {
      fundraiserId,
      actorId: admin.id,
      action: 'PAYMENT_CHANNEL_APPROVED',
      notes: 'Payment channel approved for public display after fundraiser publication.',
    },
  });

  revalidatePath('/admin/fundraisers');
  revalidatePath(`/admin/fundraisers/${fundraiserId}`);

  redirect(`/admin/fundraisers/${fundraiserId}`);
}

export async function updateFundraiserAmountRaised(formData: FormData) {
  const admin = await requireAdmin();

  const fundraiserId = String(formData.get('fundraiserId') || '');
  const amountRaisedValue = String(formData.get('amountRaised') || '').trim();

  if (!fundraiserId) {
    redirect('/admin/fundraisers');
  }

  const amountRaised = Number(amountRaisedValue);

  if (Number.isNaN(amountRaised) || amountRaised < 0) {
    redirect(`/admin/fundraisers/${fundraiserId}`);
  }

  await prisma.fundraiser.update({
    where: { id: fundraiserId },
    data: {
      amountRaised,
      auditLogs: {
        create: {
          actorId: admin.id,
          action: 'AMOUNT_RAISED_UPDATED',
          notes: `Amount raised updated to ${amountRaised}.`,
          metadata: {
            amountRaised,
          },
        },
      },
    },
  });

  revalidatePath('/admin/fundraisers');
  revalidatePath(`/admin/fundraisers/${fundraiserId}`);
  revalidatePath('/dashboard/fundraisers');
  revalidatePath('/fundraisers');

  redirect(`/admin/fundraisers/${fundraiserId}`);
}
