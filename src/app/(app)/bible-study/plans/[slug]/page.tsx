import * as React from 'react';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';

import { DailyReading } from '@/components/bible-study/daily-reading';
import { ProgressTracker } from '@/components/bible-study/progress-tracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPlanBySlug, getUserProgress } from '@/lib/bible-study/actions';
import { createClient } from '@/lib/supabase/server';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const plan = await getPlanBySlug(params.slug);
  if (!plan) return { title: 'Reading Plan | Light and Salt' };
  return {
    title: `${plan.title} | Bible Study | Light and Salt`,
    description: plan.description,
  };
}

export default async function PlanDetailPage({ params }: Props) {
  const plan = await getPlanBySlug(params.slug);
  if (!plan) notFound();

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/sign-in');
  }

  const progress = await getUserProgress(plan.id);
  const completedDays = progress
    .filter((p) => p.completed)
    .map((p) => p.dayNumber);

  // Determine current day (next incomplete day)
  const currentDay =
    plan.days.find((d) => !completedDays.includes(d.dayNumber))?.dayNumber ?? 1;

  // Find the current day's data
  const currentDayData = plan.days.find((d) => d.dayNumber === currentDay);
  const currentDayProgress = progress.find((p) => p.dayNumber === currentDay) ?? null;

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4">
        {plan.coverImageUrl ? (
          <div
            className="hidden h-24 w-24 shrink-0 rounded-lg bg-cover bg-center sm:block"
            style={{ backgroundImage: `url(${plan.coverImageUrl})` }}
          />
        ) : (
          <div className="hidden h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-navy/10 to-gold/10 sm:flex">
            <BookOpen className="h-8 w-8 text-gold/60" />
          </div>
        )}
        <div>
          <h1 className="font-serif text-3xl tracking-tight text-navy">
            {plan.title}
          </h1>
          <p className="mt-2 text-muted-foreground">{plan.description}</p>
        </div>
      </div>

      {/* Progress Tracker */}
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressTracker
            totalDays={plan.totalDays}
            completedDays={completedDays}
            currentDay={currentDay}
          />
        </CardContent>
      </Card>

      {/* Current Day Reading */}
      {currentDayData && (
        <Card>
          <CardHeader>
            <CardTitle>Day {currentDay}</CardTitle>
          </CardHeader>
          <CardContent>
            <DailyReading
              day={currentDayData}
              progress={currentDayProgress}
              planId={plan.id}
            />
          </CardContent>
        </Card>
      )}

      {/* Day-by-day List */}
      <section className="space-y-4">
        <h2 className="font-serif text-xl text-navy">All Days</h2>
        <div className="space-y-2">
          {plan.days.map((day) => {
            const isCompleted = completedDays.includes(day.dayNumber);
            return (
              <div
                key={day.id}
                className={`flex items-center gap-3 rounded-md border p-3 ${
                  isCompleted
                    ? 'border-green-200 bg-green-50'
                    : day.dayNumber === currentDay
                      ? 'border-gold/40 bg-gold/5'
                      : 'border-border'
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : day.dayNumber === currentDay
                        ? 'bg-gold text-navy'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? '\u2713' : day.dayNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-navy truncate">
                    {day.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {day.scriptureReference}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
