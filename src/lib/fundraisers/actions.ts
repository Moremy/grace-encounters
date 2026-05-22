'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { FundraiserPaymentChannelType, FundraiserType } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function requireUserProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in?error=Please%20sign%20in%20to%20submit%20a%20fundraiser');
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true },
  });

  if (!profile) {
    redirect('/fundraisers/new?error=Profile%20not%20found');
  }

  return profile;
}

function readFundraiserForm(formData: FormData) {
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const type = String(formData.get('type') || '') as FundraiserType;
  const targetAmount = String(formData.get('targetAmount') || '').trim();
  const currency = String(formData.get('currency') || 'KES').trim();
  const deadlineValue = String(formData.get('deadline') || '').trim();

  const beneficiaryName = String(formData.get('beneficiaryName') || '').trim();
  const beneficiaryRelationship = String(formData.get('beneficiaryRelationship') || '').trim();
  const requesterName = String(formData.get('requesterName') || '').trim();
  const requesterContact = String(formData.get('requesterContact') || '').trim();

  const paymentChannelType = String(
    formData.get('paymentChannelType') || '',
  ) as FundraiserPaymentChannelType;
  const paymentChannelDetails = String(formData.get('paymentChannelDetails') || '').trim();

  return {
    title,
    description,
    type,
    targetAmount,
    currency,
    deadlineValue,
    beneficiaryName,
    beneficiaryRelationship,
    requesterName,
    requesterContact,
    paymentChannelType,
    paymentChannelDetails,
  };
}

function validateFundraiserForm(data: ReturnType<typeof readFundraiserForm>, redirectPath: string) {
  if (
    !data.title ||
    !data.description ||
    !data.type ||
    !data.targetAmount ||
    !data.beneficiaryName ||
    !data.beneficiaryRelationship ||
    !data.requesterName ||
    !data.requesterContact
  ) {
    redirect(`${redirectPath}?error=Please%20complete%20all%20required%20fields`);
  }

  const targetAmount = Number(data.targetAmount);

  if (Number.isNaN(targetAmount) || targetAmount <= 0) {
    redirect(`${redirectPath}?error=Please%20enter%20a%20valid%20target%20amount`);
  }

  return targetAmount;
}

export async function createFundraiser(formData: FormData) {
  const profile = await requireUserProfile();
  const data = readFundraiserForm(formData);
  const targetAmount = validateFundraiserForm(data, '/fundraisers/new');

  const slug = `${slugify(data.title)}-${Date.now()}`;

  const fundraiser = await prisma.fundraiser.create({
    data: {
      slug,
      title: data.title,
      description: data.description,
      type: data.type,
      targetAmount,
      currency: data.currency,
      deadline: data.deadlineValue ? new Date(data.deadlineValue) : null,
      beneficiaryName: data.beneficiaryName,
      beneficiaryRelationship: data.beneficiaryRelationship,
      requesterId: profile.id,
      requesterName: data.requesterName,
      requesterContact: data.requesterContact,
      status: 'SUBMITTED',
      submittedAt: new Date(),

      paymentChannels:
        data.paymentChannelType && data.paymentChannelDetails
          ? {
              create: {
                channelType: data.paymentChannelType,
                channelLabel: data.paymentChannelType.replaceAll('_', ' '),
                channelDetails: data.paymentChannelDetails,
                isApproved: false,
              },
            }
          : undefined,

      auditLogs: {
        create: {
          actorId: profile.id,
          action: 'SUBMITTED',
          oldStatus: null,
          newStatus: 'SUBMITTED',
          notes: 'Fundraiser submitted for admin and treasury review.',
        },
      },
    },
  });

  revalidatePath('/dashboard/fundraisers');
  revalidatePath('/admin/fundraisers');

  redirect(`/dashboard/fundraisers?submitted=${fundraiser.id}`);
}

export async function resubmitFundraiser(formData: FormData) {
  const profile = await requireUserProfile();

  const fundraiserId = String(formData.get('fundraiserId') || '');
  const data = readFundraiserForm(formData);

  if (!fundraiserId) {
    redirect('/dashboard/fundraisers');
  }

  const targetAmount = validateFundraiserForm(data, `/dashboard/fundraisers/${fundraiserId}/edit`);

  const existingFundraiser = await prisma.fundraiser.findFirst({
    where: {
      id: fundraiserId,
      requesterId: profile.id,
    },
    select: {
      id: true,
      status: true,
      slug: true,
      paymentChannels: {
        select: {
          id: true,
        },
        take: 1,
      },
    },
  });

  if (!existingFundraiser) {
    redirect('/dashboard/fundraisers');
  }

  if (existingFundraiser.status !== 'MORE_INFO_REQUIRED') {
    redirect('/dashboard/fundraisers');
  }

  await prisma.fundraiser.update({
    where: {
      id: fundraiserId,
    },
    data: {
      title: data.title,
      description: data.description,
      type: data.type,
      targetAmount,
      currency: data.currency,
      deadline: data.deadlineValue ? new Date(data.deadlineValue) : null,
      beneficiaryName: data.beneficiaryName,
      beneficiaryRelationship: data.beneficiaryRelationship,
      requesterName: data.requesterName,
      requesterContact: data.requesterContact,
      status: 'SUBMITTED',
      verified: false,
      published: false,
      suspiciousFlag: false,
      moreInfoMessage: null,
      submittedAt: new Date(),

      auditLogs: {
        create: {
          actorId: profile.id,
          action: 'RESUBMITTED',
          oldStatus: existingFundraiser.status,
          newStatus: 'SUBMITTED',
          notes: 'Fundraiser updated and resubmitted after more information was requested.',
        },
      },
    },
  });

  if (data.paymentChannelType && data.paymentChannelDetails) {
    const existingChannelId = existingFundraiser.paymentChannels[0]?.id;

    if (existingChannelId) {
      await prisma.fundraiserPaymentChannel.update({
        where: {
          id: existingChannelId,
        },
        data: {
          channelType: data.paymentChannelType,
          channelLabel: data.paymentChannelType.replaceAll('_', ' '),
          channelDetails: data.paymentChannelDetails,
          isApproved: false,
          reviewedById: null,
          reviewedAt: null,
        },
      });
    } else {
      await prisma.fundraiserPaymentChannel.create({
        data: {
          fundraiserId,
          channelType: data.paymentChannelType,
          channelLabel: data.paymentChannelType.replaceAll('_', ' '),
          channelDetails: data.paymentChannelDetails,
          isApproved: false,
        },
      });
    }
  }

  revalidatePath('/dashboard/fundraisers');
  revalidatePath(`/dashboard/fundraisers/${fundraiserId}/edit`);
  revalidatePath('/admin/fundraisers');
  revalidatePath(`/admin/fundraisers/${fundraiserId}`);
  revalidatePath('/fundraisers');

  redirect(`/dashboard/fundraisers?resubmitted=${fundraiserId}`);
}
