import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Flame, Calendar, Bookmark } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReadingPlanCard } from '@/components/bible-study/reading-plan-card';
import { ScriptureBookmarkCard } from '@/components/bible-study/scripture-bookmark';
import {
  getReadingPlans,
  getUserStudyStats,
  getMyBookmarks,
  getUserProgress,
} from '@/lib/bible-study/actions';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Bible Study | Light Bearers',
  description: 'Grow in faith through structured reading plans, daily scripture, and community study.',
};

export default async function BibleStudyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const plans = await getReadingPlans();
  let stats = null;
  let bookmarks: Awaited<ReturnType<typeof getMyBookmarks>> = [];
  const planProgressMap: Record<string, { completed: number; total: number }> = {};

  if (user) {
    stats = await getUserStudyStats();
    bookmarks = await getMyBookmarks();

    // Get progress for each plan
    for (const plan of plans) {
      const progress = await getUserProgress(plan.id);
      const completedCount = progress.filter((p) => p.completed).length;
      if (completedCount > 0) {
        planProgressMap[plan.id] = {
          completed: completedCount,
          total: plan.totalDays,
        };
      }
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-navy">
          Bible Study
        </h1>
        <p className="mt-2 text-muted-foreground">
          Grow in wisdom and faith through daily scripture reading and reflection.
        </p>
      </div>

      {/* My Stats */}
      {stats && (
        <section className="space-y-4">
          <h2 className="font-serif text-xl text-navy">My Stats</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="mx-auto h-5 w-5 text-gold mb-1" />
                <p className="text-2xl font-bold text-navy">{stats.plansStarted}</p>
                <p className="text-xs text-muted-foreground">Plans Started</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="mx-auto h-5 w-5 text-gold mb-1" />
                <p className="text-2xl font-bold text-navy">{stats.daysCompleted}</p>
                <p className="text-xs text-muted-foreground">Days Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Flame className="mx-auto h-5 w-5 text-gold mb-1" />
                <p className="text-2xl font-bold text-navy">{stats.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Bookmark className="mx-auto h-5 w-5 text-gold mb-1" />
                <p className="text-2xl font-bold text-navy">{stats.bookmarksCount}</p>
                <p className="text-xs text-muted-foreground">Bookmarks</p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Available Plans */}
      <section className="space-y-4">
        <h2 className="font-serif text-xl text-navy">Reading Plans</h2>
        {plans.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No reading plans are available yet. Check back soon.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <ReadingPlanCard
                key={plan.id}
                plan={plan}
                userProgress={planProgressMap[plan.id]}
              />
            ))}
          </div>
        )}
      </section>

      {/* My Bookmarks */}
      {bookmarks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-navy">My Bookmarks</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/bible-study/bookmarks">View All</Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {bookmarks.slice(0, 5).map((bookmark) => (
              <ScriptureBookmarkCard key={bookmark.id} bookmark={bookmark} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
