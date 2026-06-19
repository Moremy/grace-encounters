import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, Calendar } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/brand/reveal';
import { getPlanBySlug } from '@/lib/bible-study/actions';
import { createClient } from '@/lib/supabase/server';

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const plan = await getPlanBySlug(params.slug);
  if (!plan) return { title: 'Bible Study' };
  return {
    title: `${plan.title} | Bible Study`,
    description: plan.description,
  };
}

export default async function PublicPlanDetailPage({
  params,
}: {
  params: Params;
}) {
  const plan = await getPlanBySlug(params.slug);
  if (!plan) notFound();

  // Detect a signed-in visitor so we can point them at the dashboard view
  // (which tracks their progress). Signed-out visitors get a sign-up CTA.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const previewDay = plan.days[0];

  return (
    <>
      <section className="bg-ivory py-16">
        <div className="max-w-4xl mx-auto px-6">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/bible-study">
              <ArrowLeft className="mr-1 h-4 w-4" /> All reading plans
            </Link>
          </Button>

          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {plan.coverImageUrl ? (
              <div
                className="h-32 w-32 shrink-0 rounded-lg bg-cover bg-center"
                style={{ backgroundImage: `url(${plan.coverImageUrl})` }}
              />
            ) : (
              <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-navy/10 to-gold/10">
                <BookOpen className="h-10 w-10 text-gold/60" />
              </div>
            )}

            <div className="flex-1">
              <h1 className="font-serif text-3xl md:text-4xl text-navy">
                {plan.title}
              </h1>
              <p className="mt-3 text-muted-foreground">{plan.description}</p>
              <p className="mt-4 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-gold">
                <Calendar className="h-3.5 w-3.5" />
                {plan.totalDays}-day plan
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {user ? (
                  <Button asChild variant="sacred">
                    <Link href={`/dashboard/bible-study/plans/${plan.slug}`}>
                      Open in My Dashboard
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="sacred">
                      <Link
                        href={`/sign-up?next=${encodeURIComponent(
                          `/dashboard/bible-study/plans/${plan.slug}`,
                        )}`}
                      >
                        Sign Up to Track Progress
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link
                        href={`/sign-in?next=${encodeURIComponent(
                          `/dashboard/bible-study/plans/${plan.slug}`,
                        )}`}
                      >
                        Sign In
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Day 1 preview — anyone can read it */}
      {previewDay && (
        <section className="bg-background py-16">
          <div className="max-w-3xl mx-auto px-6">
            <Reveal>
              <p className="text-xs uppercase tracking-widest text-gold">
                Day 1 Preview
              </p>
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>{previewDay.title}</CardTitle>
                  <p className="text-sm font-medium text-navy mt-1">
                    {previewDay.scriptureReference}
                  </p>
                </CardHeader>
                <CardContent>
                  <blockquote className="border-l-4 border-gold pl-6 font-serif text-lg italic text-navy">
                    {previewDay.scripture}
                  </blockquote>
                  {previewDay.reflection && (
                    <p className="mt-6 text-muted-foreground whitespace-pre-wrap">
                      {previewDay.reflection}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>
      )}

      {/* Day-by-day overview */}
      {plan.days.length > 0 && (
        <section className="bg-ivory/50 py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="font-serif text-2xl text-navy">All Days</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              An overview of the full plan. Sign in to read each day&apos;s
              full reflection and mark your progress.
            </p>
            <ol className="mt-6 space-y-2">
              {plan.days.map((day) => (
                <li
                  key={day.id}
                  className="flex items-start gap-3 rounded-md border border-border bg-white p-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    {day.dayNumber}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy">{day.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {day.scriptureReference}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </>
  );
}
