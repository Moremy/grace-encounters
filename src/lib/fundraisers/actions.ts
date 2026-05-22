'use server';

import { redirect } from 'next/navigation';
import {
  FundraiserPaymentChannelType,
  FundraiserType,
} from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function createFundraiser(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in?error=Please%20sign%20in%20to%20submit%20a%20fundraiser');
  }

  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const type = String(formData.get('type') || '') as FundraiserType;
  const targetAmount = String(formData.get('targetAmount') || '').trim();
  const currency = String(formData.get('currency') || 'KES').trim();
  const deadlineValue = String(formData.get('deadline') || '').trim();

  const beneficiaryName = String(formData.get('beneficiaryName') || '').trim();
  const beneficiaryRelationship = String(
    formData.get('beneficiaryRelationship') || '',
  ).trim();
  const requesterName = String(formData.get('requesterName') || '').trim();
  const requesterContact = String(formData.get('requesterContact') || '').trim();

  const paymentChannelType = String(
    formData.get('paymentChannelType') || '',
  ) as FundraiserPaymentChannelType;
  const paymentChannelDetails = String(
    formData.get('paymentChannelDetails') || '',
  ).trim();

  if (
    !title ||
    !description ||
    !type ||
    !targetAmount ||
    !beneficiaryName ||
    !beneficiaryRelationship ||
    !requesterName ||
    !requesterContact
  ) {
    redirect('/fundraisers/new?error=Please%20complete%20all%20required%20fields');
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true },
  });

  if (!profile) {
    redirect('/fundraisers/new?error=Profile%20not%20found');
  }

  const slug = `${slugify(title)}-${Date.now()}`;

  const fundraiser = await prisma.fundraiser.create({
    data: {
      slug,
      title,
      description,
      type,
      targetAmount,
      currency,
      deadline: deadlineValue ? new Date(deadlineValue) : null,
      beneficiaryName,
      beneficiaryRelationship,
      requesterId: profile.id,
      requesterName,
      requesterContact,
      status: 'SUBMITTED',
      submittedAt: new Date(),

      paymentChannels:
        paymentChannelType && paymentChannelDetails
          ? {
              create: {
                channelType: paymentChannelType,
                channelLabel: paymentChannelType.replaceAll('_', ' '),
                channelDetails: paymentChannelDetails,
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

  redirect(`/dashboard/fundraisers?submitted=${fundraiser.id}`);
}