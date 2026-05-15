import type { Metadata } from 'next';
import Link from 'next/link';
import { Users } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllGroupsAdmin } from '@/lib/community/actions';

export const metadata: Metadata = {
  title: 'Manage Community Groups | Admin | Light and Salt',
  description: 'Create and manage community groups.',
};

const categoryLabels: Record<string, string> = {
  PRAYER: 'Prayer',
  BIBLE_STUDY: 'Bible Study',
  WORSHIP: 'Worship',
  FELLOWSHIP: 'Fellowship',
  OUTREACH: 'Outreach',
  YOUTH: 'Youth',
  WOMEN: 'Women',
  MEN: 'Men',
};

export default async function AdminCommunityPage() {
  const groups = await getAllGroupsAdmin();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-navy">
            Manage Community Groups
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create and manage groups for the community.
          </p>
        </div>
        <Link href="/admin/community/new">
          <Button variant="sacred">New Group</Button>
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-16">
          <Users className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            No community groups yet. Create your first group to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <span className="inline-block self-start rounded-full bg-gold/15 text-gold px-3 py-1 text-xs font-medium">
                  {categoryLabels[group.category] ?? group.category}
                </span>
                <CardTitle className="mt-3 text-lg">{group.name}</CardTitle>
                <CardDescription>
                  {group.memberCount} members &middot; Created{' '}
                  {new Date(group.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {group.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
