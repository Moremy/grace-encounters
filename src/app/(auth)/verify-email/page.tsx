import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Verify Email - Light Bearers',
  description: 'Check your email to verify your Light Bearers account.',
};

export default function VerifyEmailPage() {
  return (
    <Card className="text-center">
      <CardHeader className="items-center">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gold/20">
          <Mail className="h-6 w-6 text-gold" />
        </div>
        <CardTitle className="text-navy">Check Your Email</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          We have sent a verification link to your email address. Please check your inbox and click
          the link to verify your account.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          If you don&apos;t see the email, check your spam folder.
        </p>
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
