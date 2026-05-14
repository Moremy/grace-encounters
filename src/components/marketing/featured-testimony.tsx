import * as React from 'react';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';

export function FeaturedTestimony() {
  return (
    <section className="bg-ivory/50 py-24">
      <div className="max-w-6xl mx-auto px-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Featured Testimony
              </p>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                Pending review
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <blockquote className="font-serif text-xl md:text-2xl text-navy leading-relaxed">
              First testimonies coming soon. Submissions are read prayerfully and published with care.
            </blockquote>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">Reviewed before publishing.</p>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
