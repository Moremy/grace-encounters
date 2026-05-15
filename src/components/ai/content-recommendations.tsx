'use client';

import * as React from 'react';
import Link from 'next/link';
import { Heart, Sun, Mic } from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { getContentRecommendations } from '@/lib/ai/actions';
import type { ContentRecommendation } from '@/lib/ai/actions';

interface ContentRecommendationsProps {
  userId: string;
}

const typeConfig = {
  testimony: {
    icon: Heart,
    label: 'Testimony',
    href: '/testimonies',
    color: 'text-rose-500',
  },
  devotional: {
    icon: Sun,
    label: 'Devotional',
    href: '/devotionals',
    color: 'text-gold',
  },
  sermon: {
    icon: Mic,
    label: 'Sermon',
    href: '/sermons',
    color: 'text-navy',
  },
} as const;

export function ContentRecommendations({ userId }: ContentRecommendationsProps) {
  const [recommendations, setRecommendations] = React.useState<
    ContentRecommendation[]
  >([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRecommendations() {
      try {
        const results = await getContentRecommendations(userId);
        setRecommendations(results);
      } catch {
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [userId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">For You</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 w-1/3 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((rec, index) => {
              const config = typeConfig[rec.type];
              const Icon = config.icon;

              return (
                <Link
                  key={`${rec.type}-${index}`}
                  href={config.href}
                  className="flex items-start gap-3 rounded-md border border-border/40 p-3 transition-colors hover:bg-muted/50"
                >
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.color}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-navy">
                      {config.label}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {rec.reason}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No recommendations available right now.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
