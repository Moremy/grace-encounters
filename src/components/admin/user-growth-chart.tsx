import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AnalyticsChart, type ChartDataPoint } from './analytics-chart';
import type { GrowthDataPoint } from '@/lib/admin/analytics';

interface UserGrowthChartProps {
  data: GrowthDataPoint[];
  period: '7d' | '30d' | '90d';
}

export function UserGrowthChart({ data, period }: UserGrowthChartProps) {
  const periodLabel =
    period === '7d'
      ? 'Last 7 Days'
      : period === '30d'
        ? 'Last 30 Days'
        : 'Last 90 Days';

  const chartData: ChartDataPoint[] = data.map((d) => ({
    label: d.date.slice(5), // MM-DD format
    value: d.count,
  }));

  const totalNew = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          User Growth - {periodLabel}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {totalNew} new registrations
        </p>
      </CardHeader>
      <CardContent>
        <AnalyticsChart
          data={chartData}
          mode="bar"
          height={180}
          color="var(--color-navy, #1e3a5f)"
        />
      </CardContent>
    </Card>
  );
}
