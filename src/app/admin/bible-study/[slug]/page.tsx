import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, Calendar } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addPlanDay, getPlanBySlug } from '@/lib/bible-study/actions';

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const plan = await getPlanBySlug(params.slug);
  if (!plan) return { title: 'Bible Study Plan | Admin' };
  return { title: `${plan.title} | Admin Bible Study` };
}

export default async function AdminPlanDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const plan = await getPlanBySlug(params.slug);
  if (!plan) notFound();

  const errorMessage =
    typeof searchParams.error === 'string'
      ? decodeURIComponent(searchParams.error)
      : undefined;

  // Suggest the next available day number for convenience.
  const usedNumbers = new Set(plan.days.map((d) => d.dayNumber));
  let nextDayNumber = 1;
  while (usedNumbers.has(nextDayNumber)) nextDayNumber += 1;

  return (
    <div className="space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-3">
          <Link href="/admin/bible-study">
            <ArrowLeft className="mr-1 h-4 w-4" /> All plans
          </Link>
        </Button>
        <h1 className="font-serif text-3xl tracking-tight text-navy">
          {plan.title}
        </h1>
        <p className="mt-2 text-muted-foreground">{plan.description}</p>
        <p className="mt-3 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-gold">
          <Calendar className="h-3.5 w-3.5" />
          {plan.days.length} of {plan.totalDays} days added
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 text-sm">
          {errorMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add a Day</CardTitle>
          <CardDescription>
            Pair scripture with an optional reflection prompt. Days are shown to
            readers in numerical order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={addPlanDay} className="space-y-4">
            <input type="hidden" name="planId" value={plan.id} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[120px,1fr]">
              <div className="space-y-2">
                <Label htmlFor="dayNumber">Day #</Label>
                <Input
                  id="dayNumber"
                  name="dayNumber"
                  type="number"
                  min={1}
                  max={plan.totalDays}
                  defaultValue={nextDayNumber}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Day Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. The Lord is My Shepherd"
                  required
                  minLength={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scriptureReference">Scripture Reference</Label>
              <Input
                id="scriptureReference"
                name="scriptureReference"
                placeholder="e.g. Psalm 23:1-6"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scripture">Scripture Text</Label>
              <textarea
                id="scripture"
                name="scripture"
                placeholder="Paste the verse text here..."
                required
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reflection">
                Reflection{' '}
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <textarea
                id="reflection"
                name="reflection"
                placeholder="A short reflection or a question for the reader to consider..."
                rows={6}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <Button type="submit" variant="sacred">
              Add Day
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-serif text-xl text-navy">Days in this Plan</h2>
        {plan.days.length === 0 ? (
          <div className="mt-4 text-center py-12 rounded-lg border border-dashed border-border">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              No days added yet. Use the form above to add the first day.
            </p>
          </div>
        ) : (
          <ol className="mt-4 space-y-2">
            {plan.days.map((day) => (
              <li
                key={day.id}
                className="flex items-start gap-3 rounded-md border border-border bg-white p-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold/20 text-xs font-medium text-navy">
                  {day.dayNumber}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-navy">{day.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {day.scriptureReference}
                  </p>
                  {day.reflection && (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                      {day.reflection}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
