import type { Metadata } from 'next';
import { Info } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createTestimony } from '@/lib/testimony/actions';
import { TestimonyFormClient } from './testimony-form-client';

export const metadata: Metadata = {
  title: 'Share a Testimony | Light Bearers',
  description: 'Share your testimony of how God has moved in your life.',
};

export default function NewTestimonyPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const errorMessage =
    typeof searchParams.error === 'string'
      ? decodeURIComponent(searchParams.error)
      : undefined;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-navy">
          Share Your Testimony
        </h1>
        <p className="mt-2 text-muted-foreground">
          Tell others how God has moved in your life. Your story could encourage
          someone today.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex items-start gap-3 rounded-md bg-muted p-4">
        <Info className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground">
          Your testimony will be reviewed by our team before being published.
          This process usually takes 1-2 business days.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Testimony Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TestimonyFormClient action={createTestimony} />
        </CardContent>
      </Card>
    </div>
  );
}
