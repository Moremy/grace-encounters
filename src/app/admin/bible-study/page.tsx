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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createReadingPlan,
  getReadingPlans,
} from '@/lib/bible-study/actions';

export const metadata: Metadata = {
  title: 'Manage Bible Study | Admin | Light Bearers',
  description:
    'Create and publish Bible reading plans for the community to follow.',
};

export default async function AdminBibleStudyPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const plans = await getReadingPlans();
  const errorMessage =
    typeof searchParams.error === 'string'
      ? decodeURIComponent(searchParams.error)
      : undefined;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-navy">
          Manage Bible Study
        </h1>
        <p className="mt-2 text-muted-foreground">
          Create reading plans, then add a day-by-day reading with scripture and
          a reflection prompt.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 text-sm">
          {errorMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>New Reading Plan</CardTitle>
          <CardDescription>
            Sets up an empty plan. Add the individual days once the plan exists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createReadingPlan} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Walking Through the Psalms"
                required
                minLength={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                placeholder="A brief overview of what readers will study and what they'll come away with."
                required
                minLength={10}
                maxLength={2000}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="totalDays">Total Days</Label>
                <Input
                  id="totalDays"
                  name="totalDays"
                  type="number"
                  min={1}
                  max={365}
                  required
                  placeholder="30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverImageUrl">
                  Cover Image URL{' '}
                  <span className="text-xs text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="coverImageUrl"
                  name="coverImageUrl"
                  type="url"
                  placeholder="https://..."
                />
              </div>
            </div>

            <Button type="submit" variant="sacred">
              Create Plan
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-serif text-xl text-navy">Existing Plans</h2>
        {plans.length === 0 ? (
          <div className="mt-4 text-center py-12 rounded-lg border border-dashed border-border">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              No reading plans yet. Create your first plan above.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="flex flex-col overflow-hidden">
                {plan.coverImageUrl ? (
                  <div
                    className="h-28 w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${plan.coverImageUrl})` }}
                  />
                ) : (
                  <div className="flex h-28 w-full items-center justify-center bg-gradient-to-br from-navy/10 to-gold/10">
                    <BookOpen className="h-8 w-8 text-gold/60" />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-base">{plan.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {plan.totalDays} days
                  </p>
                  <Button variant="outline" size="sm" className="mt-auto" asChild>
                    <Link href={`/admin/bible-study/${plan.slug}`}>
                      Manage Days
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
