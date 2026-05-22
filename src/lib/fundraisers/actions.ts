'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  FundraiserDocumentType,
  FundraiserMediaType,
  FundraiserPaymentChannelType,
  FundraiserType,
} from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

const FUNDRAISER_BUCKET = 'fundraisers';

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

function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() || 'bin';
}

function isRealFile(value: FormDataEntryValue): value is File {
  return value instanceof File && value.size > 0 && value.name.length > 0;
}

function validateDocumentFile(file: File) {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const maxSize = 10 * 1024 * 1024;

  return allowedTypes.includes(file.type) && file.size <= maxSize;
}

function validateImageFile(file: File) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024;

  return allowedTypes.includes(file.type) && file.size <= maxSize;
}

async function uploadFileToSupabaseStorage({
  userId,
  fundraiserId,
  file,
  folder,
}: {
  userId: string;
  fundraiserId: string;
  file: File;
  folder: 'documents' | 'images';
}) {
  const supabase = await createClient();

  const ext = getFileExtension(file.name);
  const safeName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .slice(0, 60);

  const storagePath = `${userId}/${fundraiserId}/${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}-${safeName}.${ext}`;

  const { data, error } = await supabase.storage.from(FUNDRAISER_BUCKET).upload(storagePath, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error('Fundraiser file upload failed.');
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(FUNDRAISER_BUCKET).getPublicUrl(data.path);

  return publicUrl;
}

async function uploadFundraiserFiles({
  userId,
  fundraiserId,
  formData,
}: {
  userId: string;
  fundraiserId: string;
  formData: FormData;
}) {
  const supportingDocuments = formData.getAll('supportingDocuments').filter(isRealFile);

  const images = formData.getAll('images').filter(isRealFile);

  for (const file of supportingDocuments) {
    if (!validateDocumentFile(file)) {
      continue;
    }

    const fileUrl = await uploadFileToSupabaseStorage({
      userId,
      fundraiserId,
      file,
      folder: 'documents',
    });

    await prisma.fundraiserDocument.create({
      data: {
        fundraiserId,
        fileUrl,
        fileName: file.name,
        documentType: 'OTHER' as FundraiserDocumentType,
        uploadedById: userId,
      },
    });
  }

  for (const file of images) {
    if (!validateImageFile(file)) {
      continue;
    }

    const fileUrl = await uploadFileToSupabaseStorage({
      userId,
      fundraiserId,
      file,
      folder: 'images',
    });

    await prisma.fundraiserMedia.create({
      data: {
        fundraiserId,
        fileUrl,
        fileName: file.name,
        mediaType: 'IMAGE' as FundraiserMediaType,
      },
    });
  }
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

  await uploadFundraiserFiles({
    userId: profile.id,
    fundraiserId: fundraiser.id,
    formData,
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

  await uploadFundraiserFiles({
    userId: profile.id,
    fundraiserId,
    formData,
  });

  revalidatePath('/dashboard/fundraisers');
  revalidatePath(`/dashboard/fundraisers/${fundraiserId}/edit`);
  revalidatePath('/admin/fundraisers');
  revalidatePath(`/admin/fundraisers/${fundraiserId}`);
  revalidatePath('/fundraisers');

  redirect(`/dashboard/fundraisers?resubmitted=${fundraiserId}`);
}
