import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { EngagementMetrics } from '@/lib/admin/analytics';

interface EngagementPanelProps {
  data: EngagementMetrics;
}

export function EngagementPanel({ data }: EngagementPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Engagement Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">
              Daily Activity (est.)
            </p>
            <p className="text-lg font-bold text-navy">
              {data.dailyActiveEstimate}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Content Created (7d)
            </p>
            <p className="text-lg font-bold text-navy">
              {data.contentCreationRate}
            </p>
          </div>
        </div>

        {/* Most Active Groups */}
        {data.mostActiveGroups.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-navy">
              Most Active Groups
            </p>
            <ul className="space-y-1.5">
              {data.mostActiveGroups.map((group) => (
                <li
                  key={group.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="truncate">{group.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {group.memberCount} members
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
