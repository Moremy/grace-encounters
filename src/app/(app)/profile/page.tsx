import * as React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { BookHeart, HandHeart, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProfileHeader } from '@/components/profile/profile-header';
import { getMyProfile } from '@/lib/profile/actions';

export const metadata: Metadata = {
  title: 'My Profile | Light and Salt',
  description: 'View and manage your profile.',
};

export default async function MyProfilePage() {
  const profile = await getMyProfile();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-navy">
          My Profile
        </h1>
        <p className="mt-2 text-muted-foreground">
          View and manage your community profile.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ProfileHeader
            displayName={profile.displayName}
            avatarUrl={profile.avatarUrl}
            bio={profile.bio}
            createdAt={profile.createdAt}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
              <BookHeart className="h-6 w-6 text-gold" />
            </div>
            <p className="mt-4 text-3xl font-bold text-navy">
              {profile._count.testimonies}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Testimonies Shared
            </p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
              <HandHeart className="h-6 w-6 text-gold" />
            </div>
            <p className="mt-4 text-3xl font-bold text-navy">
              {profile._count.prayerIntercessions}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Prayers Offered
            </p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
              <Users className="h-6 w-6 text-gold" />
            </div>
            <p className="mt-4 text-3xl font-bold text-navy">
              {profile._count.communityGroupMembers}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Groups Joined</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button variant="sacred" asChild>
          <Link href="/profile/edit">Edit Profile</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/profile/${profile.id}`}>View Public Profile</Link>
        </Button>
      </div>
    </div>
  );
}
