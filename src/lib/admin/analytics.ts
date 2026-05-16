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

  // Use raw SQL with DATE_TRUNC for database-level aggregation instead of
  // loading all rows into memory
  const grouped = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
    SELECT DATE_TRUNC('day', "createdAt") as date, COUNT(*) as count
    FROM "profiles"
    WHERE "createdAt" >= ${startDate}
    GROUP BY DATE_TRUNC('day', "createdAt")
    ORDER BY date ASC
  `;

  // Build a complete date range map with zeroes for missing days
  const dateMap = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    dateMap.set(date.toISOString().split('T')[0]!, 0);
  }

  for (const row of grouped) {
    const dateKey = new Date(row.date).toISOString().split('T')[0]!;
    dateMap.set(dateKey, Number(row.count));
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

  // Use database-level aggregation instead of loading all rows into memory
  const [aggregates, recurringCount, oneTimeCount, dailyRaw] = await Promise.all([
    prisma.donation.aggregate({
      _sum: { amount: true },
      _avg: { amount: true },
      _count: true,
      where: { status: 'COMPLETED', createdAt: { gte: startDate } },
    }),
    prisma.donation.count({
      where: { status: 'COMPLETED', createdAt: { gte: startDate }, recurring: true },
    }),
    prisma.donation.count({
      where: { status: 'COMPLETED', createdAt: { gte: startDate }, recurring: false },
    }),
    prisma.$queryRaw<Array<{ date: Date; total: unknown }>>`
      SELECT DATE_TRUNC('day', "createdAt") as date, SUM("amount") as total
      FROM "donations"
      WHERE "status" = 'COMPLETED' AND "createdAt" >= ${startDate}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    `,
  ]);

  const totalRaised = Number(aggregates._sum.amount ?? 0);
  const averageDonation = Number(aggregates._avg.amount ?? 0);
  const totalDonations = aggregates._count;

  // Top campaigns
  const topCampaigns = await prisma.donationCampaign.findMany({
    orderBy: { currentAmount: 'desc' },
    take: 5,
    select: { title: true, goalAmount: true, currentAmount: true },
  });

  // Build complete date range with zeroes for missing days
  const dateMap = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    dateMap.set(date.toISOString().split('T')[0]!, 0);
  }

  for (const row of dailyRaw) {
    const dateKey = new Date(row.date).toISOString().split('T')[0]!;
    dateMap.set(dateKey, Number(row.total));
  }

  const dailyTotals = Array.from(dateMap.entries()).map(([date, amount]) => ({
    date,
    amount,
  }));

  return {
    totalRaised,
    averageDonation,
    totalDonations,
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
