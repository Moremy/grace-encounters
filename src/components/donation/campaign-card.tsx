import * as React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface CampaignCardProps {
  campaign: {
    id: string;
    slug: string;
    title: string;
    description: string;
    goalAmount: number | { toString(): string };
    currentAmount: number | { toString(): string };
    imageUrl?: string | null;
    endDate?: Date | string | null;
  };
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const goal = Number(campaign.goalAmount);
  const current = Number(campaign.currentAmount);
  const percentage = goal > 0 ? Math.min(Math.round((current / goal) * 100), 100) : 0;

  let daysRemaining: number | null = null;
  if (campaign.endDate) {
    const end = new Date(campaign.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      {/* Image / placeholder */}
      {campaign.imageUrl ? (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-gradient-to-br from-gold/40 to-gold/10" />
      )}

      <div className="p-5">
        <h3 className="font-serif text-lg text-navy">{campaign.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {campaign.description}
        </p>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-gold transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              ${current.toLocaleString()} of ${goal.toLocaleString()}
            </span>
            <span>{percentage}%</span>
          </div>
        </div>

        {/* Days remaining */}
        {daysRemaining !== null && (
          <p className="mt-2 text-xs text-muted-foreground">
            {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Campaign ended'}
          </p>
        )}

        <Button variant="sacred" size="sm" asChild className="mt-4 w-full">
          <Link href={`/donate/${campaign.slug}`}>Donate</Link>
        </Button>
      </div>
    </div>
  );
}
