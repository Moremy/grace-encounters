import * as React from 'react';
import { BookHeart, HandHeart, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ProfileStatsProps {
  testimoniesCount: number;
  prayerCount: number;
  groupsCount: number;
}

const stats = [
  { key: 'testimonies', icon: BookHeart, label: 'Testimonies Shared' },
  { key: 'prayers', icon: HandHeart, label: 'Prayers Offered' },
  { key: 'groups', icon: Users, label: 'Groups Joined' },
] as const;

export function ProfileStats({
  testimoniesCount,
  prayerCount,
  groupsCount,
}: ProfileStatsProps) {
  const counts: Record<string, number> = {
    testimonies: testimoniesCount,
    prayers: prayerCount,
    groups: groupsCount,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
      {stats.map((stat) => (
        <Card key={stat.key} className="text-center">
          <CardContent className="pt-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
              <stat.icon className="h-6 w-6 text-gold" />
            </div>
            <p className="mt-4 text-3xl font-bold text-navy">
              {counts[stat.key]}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
