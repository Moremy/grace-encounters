import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  ClipboardCheck,
  DollarSign,
  BookHeart,
  HandHeart,
  Headphones,
  Sun,
} from 'lucide-react';

import { StatsCard } from '@/components/admin/stats-card';
import { UserGrowthChart } from '@/components/admin/user-growth-chart';
import { DonationAnalyticsPanel } from '@/components/admin/donation-analytics';
import { EngagementPanel } from '@/components/admin/engagement-panel';
import { ModerationQueue } from '@/components/admin/moderation-queue';
import {
  getDashboardStats,
  getUserGrowthMetrics,
  getEngagementMetrics,
  getDonationAnalytics,
} from '@/lib/admin/analytics';
import { getModerationQueue } from '@/lib/admin/moderation';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Light Bearers',
  description: 'Administration overview for Light Bearers.',
};

export default async function AdminDashboardPage() {
  const [stats, growthData, engagement, donations, moderation] =
    await Promise.all([
      getDashboardStats(),
      getUserGrowthMetrics('30d'),
      getEngagementMetrics(),
      getDonationAnalytics('30d'),
      getModerationQueue(undefined, 1),
    ]);

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-navy">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Overview of platform activity and pending items.
        </p>
      </div>

      {/* Top-level stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend={
            stats.newUsersWeek > 0
              ? {
                  direction: 'up',
                  percentage: Math.round(
                    (stats.newUsersWeek / Math.max(stats.totalUsers, 1)) * 100,
                  ),
                  label: 'this week',
                }
              : undefined
          }
        />
        <StatsCard
          title="New This Week"
          value={stats.newUsersWeek}
          icon={UserPlus}
        />
        <StatsCard
          title="Pending Reviews"
          value={stats.pendingReviews}
          icon={ClipboardCheck}
        />
        <StatsCard
          title="Total Donations"
          value={formatCurrency(stats.totalDonationsAmount)}
          icon={DollarSign}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Testimonies"
          value={stats.totalTestimonies}
          icon={BookHeart}
        />
        <StatsCard
          title="Prayer Requests"
          value={stats.totalPrayers}
          icon={HandHeart}
        />
        <StatsCard
          title="Sermons"
          value={stats.totalSermons}
          icon={Headphones}
        />
        <StatsCard
          title="Devotionals"
          value={stats.totalDevotionals}
          icon={Sun}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <UserGrowthChart data={growthData} period="30d" />
        <EngagementPanel data={engagement} />
      </div>

      {/* Donation analytics */}
      <DonationAnalyticsPanel data={donations} />

      {/* Moderation queue preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-navy">Recent Moderation</h2>
          <Link
            href="/admin/moderation"
            className="text-sm font-medium text-gold hover:underline"
          >
            View all
          </Link>
        </div>
        <ModerationQueue
          items={moderation.items.slice(0, 5).map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
