import * as React from 'react';
import type { Metadata } from 'next';
import { ClipboardCheck, Users, BookHeart, HandHeart } from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Grace Encounters',
  description: 'Administration overview for Grace Encounters.',
};

const statCards = [
  { title: 'Pending Reviews', icon: ClipboardCheck },
  { title: 'Total Users', icon: Users },
  { title: 'Published Testimonies', icon: BookHeart },
  { title: 'Active Prayers', icon: HandHeart },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-navy">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Overview of platform activity and pending items.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-navy">--</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
