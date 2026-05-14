import * as React from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TodayDate } from '@/components/marketing/today-date';

export function DevotionalTeaser() {
  return (
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <TodayDate className="text-xs uppercase tracking-widest text-muted-foreground" />
            <CardTitle className="mt-3 font-serif text-3xl md:text-4xl text-navy">
              Be still, and know that I am God.
            </CardTitle>
            <CardDescription className="italic">— Psalm 46:10</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/80 leading-relaxed">
              Some days the loudest faith is a quiet one. Set the noise down for a moment, breathe slowly,
              and let the steady presence of God meet you right where you are.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" asChild>
              <Link href="#">Read today&apos;s devotional →</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
