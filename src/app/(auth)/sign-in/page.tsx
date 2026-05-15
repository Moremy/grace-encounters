'use client';

import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AuthMessage } from '@/components/auth/auth-message';
import { signIn } from '@/lib/auth/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="sacred" className="w-full" disabled={pending}>
      {pending ? 'Please wait...' : 'Sign In'}
    </Button>
  );
}

export default function SignInPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-navy">Sign In</CardTitle>
        <CardDescription>Welcome back. Enter your credentials to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <AuthMessage />
        <form action={signIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-navy underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input id="password" name="password" type="password" required />
          </div>
          <SubmitButton />
        </form>
        <Separator className="my-6" />
        <div className="text-center">
          <Link
            href="/magic-link"
            className="text-sm text-muted-foreground hover:text-navy underline-offset-4 hover:underline"
          >
            Sign in with magic link
          </Link>
        </div>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="font-medium text-navy underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
