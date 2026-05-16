import * as React from 'react';
import type { Metadata } from 'next';

import { UserGrowthChart } from '@/components/admin/user-growth-chart';
import { DonationAnalyticsPanel } from '@/components/admin/donation-analytics';
import { EngagementPanel } from '@/components/admin/engagement-panel';
import { StatsCard } from '@/components/admin/stats-card';
import {
  getDashboardStats,
  getUserGrowthMetrics,
  getEngagementMetrics,
  getDonationAnalytics,
} from '@/lib/admin/analytics';
import { Users, UserPlus, BookHeart, DollarSign } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Analytics | Light and Salt Admin',
  description: 'Detailed platform analytics and growth metrics.',
};

export default async function AnalyticsPage() {
  const [stats, growth7d, growth30d, growth90d, engagement, donations30d, donations90d] =
    await Promise.all([
      getDashboardStats(),
      getUserGrowthMetrics('7d'),
      getUserGrowthMetrics('30d'),
      getUserGrowthMetrics('90d'),
      getEngagementMetrics(),
      getDonationAnalytics('30d'),
      getDonationAnalytics('90d'),
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
          Analytics
        </h1>
        <p className="mt-2 text-muted-foreground">
          Deep-dive into platform growth, engagement, and donations.
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
        />
        <StatsCard
          title="New Users (30d)"
          value={stats.newUsersMonth}
          icon={UserPlus}
        />
        <StatsCard
          title="Content Created (7d)"
          value={engagement.contentCreationRate}
          icon={BookHeart}
        />
        <StatsCard
          title="Total Raised (30d)"
          value={formatCurrency(donations30d.totalRaised)}
          icon={DollarSign}
        />
      </div>

      {/* User Growth Charts */}
      <div>
        <h2 className="mb-4 font-serif text-xl text-navy">User Growth</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <UserGrowthChart data={growth7d} period="7d" />
          <UserGrowthChart data={growth30d} period="30d" />
          <UserGrowthChart data={growth90d} period="90d" />
        </div>
      </div>

      {/* Engagement */}
      <div>
        <h2 className="mb-4 font-serif text-xl text-navy">Engagement</h2>
        <EngagementPanel data={engagement} />
      </div>

      {/* Donation Analytics */}
      <div>
        <h2 className="mb-4 font-serif text-xl text-navy">Donations</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <DonationAnalyticsPanel data={donations30d} />
          <DonationAnalyticsPanel data={donations90d} />
        </div>
      </div>
    </div>
  );
}
