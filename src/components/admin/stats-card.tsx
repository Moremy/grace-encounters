import * as React from 'react';
import { type LucideIcon } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
    label?: string;
  };
}

export function StatsCard({ title, value, icon: Icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-navy">{value}</p>
        {trend && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <span
              className={
                trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
              }
            >
              {trend.direction === 'up' ? '\u2191' : '\u2193'}{' '}
              {trend.percentage}%
            </span>
            {trend.label && <span>{trend.label}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
