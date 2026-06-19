import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Calendar } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/brand/reveal';
import { getReadingPlans } from '@/lib/bible-study/actions';

export const metadata: Metadata = {
  title: 'Bible Study',
  description:
    'Reading plans, scripture, and study guides from Light Bearers. Read along on your own or sign in to track your progress.',
};

export default async function PublicBibleStudyPage() {
  const plans = await getReadingPlans();

  return (
    <>
      <section className="bg-ivory py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Bible Study
          </p>
          <h1 className="mt-4 font-serif text-3xl md:text-4xl text-navy">
            Grounded in the Word
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Walk through Scripture one day at a time with structured reading
            plans. Browse the studies below — sign in to track your progress
            and save reflection notes.
          </p>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="max-w-6xl mx-auto px-6">
          {plans.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                No reading plans published yet. Check back soon — new studies
                are added regularly.
              </p>
            </div>
          ) : (
            <Reveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <Card key={plan.id} className="flex flex-col overflow-hidden">
                    {plan.coverImageUrl ? (
                      <div
                        className="h-32 w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${plan.coverImageUrl})` }}
                      />
                    ) : (
                      <div className="flex h-32 w-full items-center justify-center bg-gradient-to-br from-navy/10 to-gold/10">
                        <BookOpen className="h-10 w-10 text-gold/60" />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>{plan.title}</CardTitle>
                      <CardDescription className="line-clamp-3">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                      <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {plan.totalDays}-day plan
                      </p>
                      <Button variant="sacred" className="mt-auto" asChild>
                        <Link href={`/bible-study/${plan.slug}`}>
                          Explore Plan
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <section className="bg-ivory text-navy text-center py-32">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <span
              aria-hidden="true"
              className="mx-auto mb-8 block h-px w-16 bg-gold"
            />
            <blockquote className="font-serif text-3xl md:text-4xl text-balance text-navy">
              &ldquo;Your word is a lamp for my feet, a light on my path.&rdquo;
            </blockquote>
            <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
              — Psalm 119:105
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
