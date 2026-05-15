import * as React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BookHeart, HandHeart, Sun } from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ScriptureRecommendations } from '@/components/ai/scripture-recommendations';
import { ContentRecommendations } from '@/components/ai/content-recommendations';

export const metadata: Metadata = {
  title: 'Dashboard | Light and Salt',
  description: 'Your Light and Salt dashboard.',
};

const quickActions = [
  {
    title: 'Share a Testimony',
    description: 'Tell others how God has moved in your life.',
    href: '/testimonies',
    icon: BookHeart,
  },
  {
    title: 'Prayer Wall',
    description: 'Lift up requests and pray for the community.',
    href: '/prayer-wall',
    icon: HandHeart,
  },
  {
    title: 'Devotionals',
    description: 'Read today\'s devotional and grow in faith.',
    href: '/devotionals',
    icon: Sun,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-navy">
          Welcome back
        </h1>
        <p className="mt-2 text-muted-foreground">
          Share your testimony, visit the prayer wall, or read today&apos;s devotional.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href} className="group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardHeader>
                <action.icon className="h-6 w-6 text-gold" />
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* AI-Powered Widgets */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ScriptureRecommendations />
        <ContentRecommendations userId="anonymous" />
      </div>
    </div>
  );
}
