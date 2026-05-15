'use client';

import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AuthMessage } from '@/components/auth/auth-message';
import { forgotPassword } from '@/lib/auth/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="sacred" className="w-full" disabled={pending}>
      {pending ? 'Please wait...' : 'Send Reset Link'}
    </Button>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-navy">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email address and we will send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthMessage />
        <form action={forgotPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          </div>
          <SubmitButton />
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <Link
          href="/sign-in"
          className="text-sm font-medium text-navy underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
