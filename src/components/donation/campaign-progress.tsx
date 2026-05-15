import * as React from 'react';

interface CampaignProgressProps {
  goalAmount: number;
  currentAmount: number;
  donorCount: number;
}

export function CampaignProgress({
  goalAmount,
  currentAmount,
  donorCount,
}: CampaignProgressProps) {
  const percentage =
    goalAmount > 0 ? Math.min(Math.round((currentAmount / goalAmount) * 100), 100) : 0;

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-4 rounded-full bg-gold transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
        <div>
          <span className="font-semibold text-navy">
            ${currentAmount.toLocaleString()}
          </span>{' '}
          <span className="text-muted-foreground">
            raised of ${goalAmount.toLocaleString()} goal
          </span>
        </div>
        <div className="text-muted-foreground">
          {percentage}% funded
        </div>
        <div className="text-muted-foreground">
          {donorCount} {donorCount === 1 ? 'donor' : 'donors'}
        </div>
      </div>
    </div>
  );
}
