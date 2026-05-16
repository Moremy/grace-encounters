import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AnalyticsChart, type ChartDataPoint } from './analytics-chart';
import type { DonationAnalytics } from '@/lib/admin/analytics';

interface DonationAnalyticsPanelProps {
  data: DonationAnalytics;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DonationAnalyticsPanel({ data }: DonationAnalyticsPanelProps) {
  const chartData: ChartDataPoint[] = data.dailyTotals.map((d) => ({
    label: d.date.slice(5),
    value: d.amount,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Donation Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Raised</p>
            <p className="text-lg font-bold text-navy">
              {formatCurrency(data.totalRaised)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Average</p>
            <p className="text-lg font-bold text-navy">
              {formatCurrency(data.averageDonation)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Recurring</p>
            <p className="text-lg font-bold text-navy">{data.recurringCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">One-time</p>
            <p className="text-lg font-bold text-navy">{data.oneTimeCount}</p>
          </div>
        </div>

        {/* Chart */}
        <AnalyticsChart
          data={chartData}
          mode="line"
          height={160}
          color="var(--color-gold, #c9a227)"
          title="Daily Donation Totals"
        />

        {/* Top Campaigns */}
        {data.topCampaigns.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-navy">Top Campaigns</p>
            <div className="space-y-2">
              {data.topCampaigns.map((campaign) => {
                const progress =
                  campaign.goalAmount > 0
                    ? Math.min(
                        (campaign.currentAmount / campaign.goalAmount) * 100,
                        100,
                      )
                    : 0;
                return (
                  <div key={campaign.title} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate font-medium">
                        {campaign.title}
                      </span>
                      <span className="text-muted-foreground">
                        {formatCurrency(campaign.currentAmount)} /{' '}
                        {formatCurrency(campaign.goalAmount)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div
                        className="h-1.5 rounded-full bg-gold"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
