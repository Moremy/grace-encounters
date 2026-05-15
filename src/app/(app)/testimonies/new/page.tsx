import type { Metadata } from 'next';
import { Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createTestimony } from '@/lib/testimony/actions';

export const metadata: Metadata = {
  title: 'Share a Testimony | Grace Encounters',
  description: 'Share your testimony of how God has moved in your life.',
};

export default function NewTestimonyPage() {
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
          <form action={createTestimony} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. How God Healed My Marriage"
                required
                minLength={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Short Summary</Label>
              <textarea
                id="excerpt"
                name="excerpt"
                placeholder="A brief summary of your testimony (10-200 characters)"
                required
                minLength={10}
                maxLength={200}
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Full Testimony</Label>
              <textarea
                id="content"
                name="content"
                placeholder="Share the full story of what God has done..."
                required
                minLength={50}
                rows={10}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <Button type="submit" variant="sacred">
              Submit Testimony
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
