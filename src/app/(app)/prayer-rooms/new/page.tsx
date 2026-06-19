import * as React from 'react';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { createPrayerRoom } from '@/lib/prayer-room/actions';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { canModerate, fromPrismaRole } from '@/lib/auth/roles';

export const metadata: Metadata = {
  title: 'Create Prayer Room | Light Bearers',
  description: 'Create a new prayer room for the community.',
};

export default async function NewPrayerRoomPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  const role = fromPrismaRole(profile?.role ?? null);

  if (!canModerate(role)) {
    redirect('/dashboard');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-navy">
          Create Prayer Room
        </h1>
        <p className="mt-2 text-muted-foreground">
          Set up a new prayer room for the community to gather.
        </p>
      </div>

      {searchParams.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {decodeURIComponent(searchParams.error)}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Room Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createPrayerRoom} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Evening Prayer Session"
                required
                minLength={3}
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe the focus of this prayer room..."
                required
                minLength={10}
                maxLength={2000}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Scheduled Date &amp; Time (optional)</Label>
              <Input id="scheduledAt" name="scheduledAt" type="datetime-local" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                name="maxParticipants"
                type="number"
                defaultValue={50}
                min={2}
                max={500}
              />
            </div>

            <Button type="submit" variant="sacred" className="w-full">
              Create Prayer Room
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
