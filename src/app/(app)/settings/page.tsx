import * as React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Bell, Globe, KeyRound, LogOut, UserCog } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AuthMessage } from '@/components/auth/auth-message';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { changePassword, signOut } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Settings | Light Bearers',
  description: 'Manage your account, security, and preferences.',
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-navy">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account, security, and preferences.
        </p>
      </div>

      <AuthMessage />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="h-5 w-5 text-gold" />
            Account &amp; Security
          </CardTitle>
          <CardDescription>Your sign-in email and password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user?.email ?? ''} disabled />
            <p className="text-xs text-muted-foreground">
              This is the email you use to sign in.
            </p>
          </div>
          <Separator />
          <form action={changePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" name="password" type="password" minLength={8} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                minLength={8}
                required
              />
            </div>
            <Button type="submit" variant="sacred">
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/profile/edit" className="group">
          <Card className="h-full transition-shadow group-hover:shadow-md">
            <CardHeader>
              <UserCog className="h-6 w-6 text-gold" />
              <CardTitle className="text-lg">Profile</CardTitle>
              <CardDescription>
                Update your display name, photo, and bio.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/settings/notifications" className="group">
          <Card className="h-full transition-shadow group-hover:shadow-md">
            <CardHeader>
              <Bell className="h-6 w-6 text-gold" />
              <CardTitle className="text-lg">Notifications</CardTitle>
              <CardDescription>
                Choose which emails and push notifications you receive.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-gold" />
            Language
          </CardTitle>
          <CardDescription>Choose the language for the site.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-navy">
            <LanguageSwitcher />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <LogOut className="h-5 w-5 text-gold" />
            Sign Out
          </CardTitle>
          <CardDescription>Sign out of your account on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signOut}>
            <Button type="submit" variant="outline">
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
