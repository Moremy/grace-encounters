import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMyProfile, updateProfile } from '@/lib/profile/actions';

export const metadata: Metadata = {
  title: 'Edit Profile | Light and Salt',
  description: 'Edit your community profile.',
};

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const profile = await getMyProfile();

  const errorMessage =
    typeof searchParams.error === 'string'
      ? decodeURIComponent(searchParams.error)
      : undefined;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-navy">
          Edit Profile
        </h1>
        <p className="mt-2 text-muted-foreground">
          Update your display name, bio, and avatar.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 text-sm">
          {errorMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                name="displayName"
                placeholder="Your display name"
                defaultValue={profile.displayName ?? ''}
                minLength={2}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Between 2 and 50 characters.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                name="bio"
                placeholder="Tell the community a bit about yourself..."
                defaultValue={profile.bio ?? ''}
                rows={4}
                maxLength={500}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">
                Up to 500 characters.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                name="avatarUrl"
                type="url"
                placeholder="https://..."
                defaultValue={profile.avatarUrl ?? ''}
              />
              <p className="text-xs text-muted-foreground">
                A link to your profile photo.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" variant="sacred">
                Save Changes
              </Button>
              <Button variant="outline" asChild>
                <Link href="/profile">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Profile
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
