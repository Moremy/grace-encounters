'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canAdmin, fromPrismaRole } from '@/lib/auth/roles';
import { slugify } from './utils';
import { donationSchema, campaignSchema } from './schemas';

// ---------------------------------------------------------------------------
// Public / Member actions
// ---------------------------------------------------------------------------

export async function getDonationCampaigns() {
  return prisma.donationCampaign.findMany({
    where: { active: true },
    orderBy: { startDate: 'desc' },
  });
}

export async function getCampaignBySlug(slug: string) {
  const campaign = await prisma.donationCampaign.findFirst({
    where: { slug },
    include: {
      donations: {
        where: { status: 'COMPLETED' },
        select: { id: true },
      },
    },
  });

  if (!campaign) return null;

  return {
    ...campaign,
    donorCount: campaign.donations.length,
    donations: undefined,
  };
}

export async function createDonation(data: {
  amount: number;
  currency: string;
  provider: string;
  campaignId?: string;
  recurring: boolean;
  recurringInterval?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const validation = donationSchema.safeParse(data);
  if (!validation.success) {
    throw new Error(validation.error.errors[0]?.message ?? 'Invalid input');
  }

  const parsed = validation.data;

  // Validate campaign exists and is active if provided
  if (parsed.campaignId) {
    const campaign = await prisma.donationCampaign.findFirst({
      where: { id: parsed.campaignId, active: true },
    });
    if (!campaign) {
      throw new Error('Campaign not found or is no longer active');
    }
  }

  const donation = await prisma.donation.create({
    data: {
      donorId: user.id,
      amount: parsed.amount,
      currency: parsed.currency,
      provider: parsed.provider as 'STRIPE' | 'MPESA' | 'PAYPAL',
      campaignId: parsed.campaignId || null,
      status: 'PENDING',
      recurring: parsed.recurring,
      recurringInterval: parsed.recurringInterval || null,
    },
  });

  return donation;
}

export async function getMyDonations() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  return prisma.donation.findMany({
    where: { donorId: user.id },
    include: {
      campaign: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDonationStats() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const donations = await prisma.donation.findMany({
    where: { donorId: user.id, status: 'COMPLETED' },
    select: { amount: true },
  });

  const totalGiven = donations.reduce(
    (sum, d) => sum + Number(d.amount),
    0,
  );

  const activeCampaigns = await prisma.donationCampaign.count({
    where: { active: true },
  });

  return {
    totalGiven,
    donationCount: donations.length,
    activeCampaigns,
  };
}

export async function updateDonationStatus(
  donationId: string,
  status: string,
  providerTransactionId?: string,
) {
  const validStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status');
  }

  const donation = await prisma.donation.update({
    where: { id: donationId },
    data: {
      status: status as 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED',
      providerTransactionId: providerTransactionId || undefined,
    },
  });

  // If completed and linked to a campaign, increment currentAmount
  if (status === 'COMPLETED' && donation.campaignId) {
    await prisma.donationCampaign.update({
      where: { id: donation.campaignId },
      data: {
        currentAmount: {
          increment: donation.amount,
        },
      },
    });
  }

  return donation;
}

// ---------------------------------------------------------------------------
// Admin actions
// ---------------------------------------------------------------------------

async function requireAdmin() {
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

  if (!canAdmin(role)) {
    redirect('/dashboard');
  }

  return user;
}

export async function createCampaign(formData: FormData) {
  await requireAdmin();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const goalAmount = Number(formData.get('goalAmount'));
  const imageUrl = (formData.get('imageUrl') as string) || undefined;
  const startDate = formData.get('startDate') as string;
  const endDate = (formData.get('endDate') as string) || undefined;

  const validation = campaignSchema.safeParse({
    title,
    description,
    goalAmount,
    imageUrl: imageUrl || undefined,
    startDate,
    endDate: endDate || undefined,
  });

  if (!validation.success) {
    const message = encodeURIComponent(
      validation.error.errors[0]?.message ?? 'Invalid input',
    );
    redirect(`/admin/donations/campaigns/new?error=${message}`);
  }

  const slug = slugify(title);

  await prisma.donationCampaign.create({
    data: {
      slug,
      title,
      description,
      goalAmount,
      imageUrl: imageUrl || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  revalidatePath('/admin/donations/campaigns');
  redirect('/admin/donations/campaigns');
}

export async function updateCampaign(campaignId: string, formData: FormData) {
  await requireAdmin();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const goalAmount = Number(formData.get('goalAmount'));
  const imageUrl = (formData.get('imageUrl') as string) || undefined;
  const startDate = formData.get('startDate') as string;
  const endDate = (formData.get('endDate') as string) || undefined;

  const validation = campaignSchema.safeParse({
    title,
    description,
    goalAmount,
    imageUrl: imageUrl || undefined,
    startDate,
    endDate: endDate || undefined,
  });

  if (!validation.success) {
    const message = encodeURIComponent(
      validation.error.errors[0]?.message ?? 'Invalid input',
    );
    redirect(`/admin/donations/campaigns?error=${message}`);
  }

  await prisma.donationCampaign.update({
    where: { id: campaignId },
    data: {
      title,
      description,
      goalAmount,
      imageUrl: imageUrl || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  revalidatePath('/admin/donations/campaigns');
  redirect('/admin/donations/campaigns');
}

export async function toggleCampaignActive(campaignId: string) {
  await requireAdmin();

  const campaign = await prisma.donationCampaign.findUnique({
    where: { id: campaignId },
    select: { active: true },
  });

  if (!campaign) return;

  await prisma.donationCampaign.update({
    where: { id: campaignId },
    data: { active: !campaign.active },
  });

  revalidatePath('/admin/donations/campaigns');
}

export async function getAdminDonationStats() {
  await requireAdmin();

  const donations = await prisma.donation.findMany({
    where: { status: 'COMPLETED' },
    select: { amount: true, donorId: true },
  });

  const totalRaised = donations.reduce(
    (sum, d) => sum + Number(d.amount),
    0,
  );
  const uniqueDonors = new Set(donations.map((d) => d.donorId)).size;
  const campaignsCount = await prisma.donationCampaign.count();

  return {
    totalRaised,
    totalDonors: uniqueDonors,
    campaignsCount,
  };
}

export async function getAllDonationsAdmin() {
  await requireAdmin();

  return prisma.donation.findMany({
    include: {
      donor: { select: { displayName: true } },
      campaign: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}
