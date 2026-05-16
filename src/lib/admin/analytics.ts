'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canAdmin, fromPrismaRole } from '@/lib/auth/roles';

// ---------------------------------------------------------------------------
// Auth helper
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

// ---------------------------------------------------------------------------
// Dashboard Stats
// ---------------------------------------------------------------------------

export interface DashboardStats {
  totalUsers: number;
  newUsersWeek: number;
  newUsersMonth: number;
  totalTestimonies: number;
  pendingReviews: number;
  totalPrayers: number;
  activePrayerRooms: number;
  totalDonationsAmount: number;
  totalSermons: number;
  totalDevotionals: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersWeek,
    newUsersMonth,
    totalTestimonies,
    pendingTestimonies,
    pendingPrayers,
    totalPrayers,
    activePrayerRooms,
    donationAgg,
    totalSermons,
    totalDevotionals,
  ] = await Promise.all([
    prisma.profile.count(),
    prisma.profile.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.profile.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.testimony.count(),
    prisma.testimony.count({ where: { status: 'PENDING' } }),
    prisma.prayerRequest.count({ where: { status: 'PENDING' } }),
    prisma.prayerRequest.count(),
    prisma.prayerRoom.count({ where: { isLive: true } }),
    prisma.donation.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    }),
    prisma.sermon.count(),
    prisma.devotional.count(),
  ]);

  return {
    totalUsers,
    newUsersWeek,
    newUsersMonth,
    totalTestimonies,
    pendingReviews: pendingTestimonies + pendingPrayers,
    totalPrayers,
    activePrayerRooms,
    totalDonationsAmount: Number(donationAgg._sum.amount ?? 0),
    totalSermons,
    totalDevotionals,
  };
}

// ---------------------------------------------------------------------------
// User Growth Metrics
// ---------------------------------------------------------------------------

export interface GrowthDataPoint {
  date: string;
  count: number;
}

export async function getUserGrowthMetrics(
  period: '7d' | '30d' | '90d' = '30d',
): Promise<GrowthDataPoint[]> {
  await requireAdmin();

  const now = new Date();
  const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
  const days = daysMap[period];
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const users = await prisma.profile.findMany({
    where: { createdAt: { gte: startDate } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  // Group by date
  const dateMap = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    dateMap.set(date.toISOString().split('T')[0], 0);
  }

  for (const user of users) {
    const dateKey = user.createdAt.toISOString().split('T')[0];
    dateMap.set(dateKey, (dateMap.get(dateKey) ?? 0) + 1);
  }

  return Array.from(dateMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));
}

// ---------------------------------------------------------------------------
// Engagement Metrics
// ---------------------------------------------------------------------------

export interface EngagementMetrics {
  dailyActiveEstimate: number;
  contentCreationRate: number;
  mostActiveGroups: Array<{ name: string; memberCount: number }>;
  recentContentCount: number;
}

export async function getEngagementMetrics(): Promise<EngagementMetrics> {
  await requireAdmin();

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Estimate daily active users based on recent activity
  const [recentNotificationReads, recentMessages, recentPrayers] =
    await Promise.all([
      prisma.notification.count({
        where: { read: true, createdAt: { gte: oneDayAgo } },
      }),
      prisma.message.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.prayerRequest.count({
        where: { createdAt: { gte: oneDayAgo } },
      }),
    ]);

  const dailyActiveEstimate =
    recentNotificationReads + recentMessages + recentPrayers;

  // Content creation rate (items created in the last 7 days)
  const [testimoniesWeek, devotionalsWeek, blogPostsWeek] = await Promise.all([
    prisma.testimony.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.devotional.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.blogArticle.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
  ]);

  const contentCreationRate = testimoniesWeek + devotionalsWeek + blogPostsWeek;

  // Most active community groups
  const mostActiveGroups = await prisma.communityGroup.findMany({
    orderBy: { memberCount: 'desc' },
    take: 5,
    select: { name: true, memberCount: true },
  });

  return {
    dailyActiveEstimate,
    contentCreationRate,
    mostActiveGroups,
    recentContentCount: contentCreationRate,
  };
}

// ---------------------------------------------------------------------------
// Donation Analytics
// ---------------------------------------------------------------------------

export interface DonationAnalytics {
  totalRaised: number;
  averageDonation: number;
  totalDonations: number;
  recurringCount: number;
  oneTimeCount: number;
  topCampaigns: Array<{
    title: string;
    goalAmount: number;
    currentAmount: number;
  }>;
  dailyTotals: Array<{ date: string; amount: number }>;
}

export async function getDonationAnalytics(
  period: '7d' | '30d' | '90d' = '30d',
): Promise<DonationAnalytics> {
  await requireAdmin();

  const now = new Date();
  const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
  const days = daysMap[period];
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const donations = await prisma.donation.findMany({
    where: { status: 'COMPLETED', createdAt: { gte: startDate } },
    select: { amount: true, recurring: true, createdAt: true },
  });

  const totalRaised = donations.reduce(
    (sum, d) => sum + Number(d.amount),
    0,
  );
  const averageDonation =
    donations.length > 0 ? totalRaised / donations.length : 0;
  const recurringCount = donations.filter((d) => d.recurring).length;
  const oneTimeCount = donations.filter((d) => !d.recurring).length;

  // Top campaigns
  const topCampaigns = await prisma.donationCampaign.findMany({
    orderBy: { currentAmount: 'desc' },
    take: 5,
    select: { title: true, goalAmount: true, currentAmount: true },
  });

  // Daily donation totals
  const dateMap = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    dateMap.set(date.toISOString().split('T')[0], 0);
  }

  for (const donation of donations) {
    const dateKey = donation.createdAt.toISOString().split('T')[0];
    dateMap.set(dateKey, (dateMap.get(dateKey) ?? 0) + Number(donation.amount));
  }

  const dailyTotals = Array.from(dateMap.entries()).map(([date, amount]) => ({
    date,
    amount,
  }));

  return {
    totalRaised,
    averageDonation,
    totalDonations: donations.length,
    recurringCount,
    oneTimeCount,
    topCampaigns: topCampaigns.map((c) => ({
      title: c.title,
      goalAmount: Number(c.goalAmount),
      currentAmount: Number(c.currentAmount),
    })),
    dailyTotals,
  };
}

// ---------------------------------------------------------------------------
// Content Moderation Queue
// ---------------------------------------------------------------------------

export interface ModerationItem {
  id: string;
  type: 'testimony' | 'prayer';
  title: string;
  authorName: string | null;
  createdAt: Date;
}

export async function getContentModerationQueue(): Promise<ModerationItem[]> {
  await requireAdmin();

  const [pendingTestimonies, pendingPrayers] = await Promise.all([
    prisma.testimony.findMany({
      where: { status: 'PENDING' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        author: { select: { displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.prayerRequest.findMany({
      where: { status: 'PENDING' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        author: { select: { displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  const items: ModerationItem[] = [
    ...pendingTestimonies.map((t) => ({
      id: t.id,
      type: 'testimony' as const,
      title: t.title,
      authorName: t.author.displayName,
      createdAt: t.createdAt,
    })),
    ...pendingPrayers.map((p) => ({
      id: p.id,
      type: 'prayer' as const,
      title: p.title,
      authorName: p.author.displayName,
      createdAt: p.createdAt,
    })),
  ];

  // Sort combined list by createdAt descending
  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return items.slice(0, 20);
}
