import * as React from 'react';
import type { Metadata } from 'next';

import { ModerationQueue } from '@/components/admin/moderation-queue';
import { StatsCard } from '@/components/admin/stats-card';
import { getModerationQueue, getModerationStats } from '@/lib/admin/moderation';
import { ClipboardCheck, CheckCircle2, XCircle, BookHeart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Content Moderation | Light Bearers Admin',
  description: 'Review and moderate user-submitted content.',
};

export default async function ModerationPage() {
  const [queue, stats] = await Promise.all([
    getModerationQueue(undefined, 1),
    getModerationStats(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-navy">
          Content Moderation
        </h1>
        <p className="mt-2 text-muted-foreground">
          Review pending content submissions, approve or reject items.
        </p>
      </div>

      {/* Moderation Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Pending Testimonies"
          value={stats.pendingTestimonies}
          icon={BookHeart}
        />
        <StatsCard
          title="Pending Prayers"
          value={stats.pendingPrayers}
          icon={ClipboardCheck}
        />
        <StatsCard
          title="Approved Today"
          value={stats.approvedToday}
          icon={CheckCircle2}
        />
        <StatsCard
          title="Rejected Today"
          value={stats.rejectedToday}
          icon={XCircle}
        />
      </div>

      {/* Full Queue */}
      <ModerationQueue
        items={queue.items.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        }))}
        showActions={true}
      />
    </div>
  );
}
