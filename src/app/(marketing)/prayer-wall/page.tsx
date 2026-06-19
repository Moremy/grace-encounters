import type { Metadata } from 'next';
import Link from 'next/link';
import { HandHeart } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/brand/reveal';
import { PrayButton } from '@/components/prayer/pray-button';
import { getApprovedPrayerRequests } from '@/lib/prayer/actions';

export const metadata: Metadata = {
  title: 'Prayer Wall | Light Bearers',
  description:
    'Join our community in prayer. Read, pray, and stand alongside one another in faith.',
};

export default async function PrayerWallPage() {
  const prayers = await getApprovedPrayerRequests();

  return (
    <>
      <section className="bg-ivory py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Prayer Wall
          </p>
          <h1 className="mt-4 font-serif text-3xl md:text-4xl text-navy">
            Community Prayers
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            A gentle place to lay down what is heavy. Read, pray, and quietly stand
            with one another in faith.
          </p>
          <div className="mt-8">
            <Button variant="sacred" asChild>
              <Link href="/prayer-wall/new">Share a Prayer Request</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            {prayers.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  No prayer requests yet. Be the first to share what is on your
                  heart.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prayers.map((prayer) => (
                  <Card key={prayer.id}>
                    <CardHeader>
                      <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                        <HandHeart className="h-5 w-5" />
                      </div>
                      <CardDescription className="mt-4">
                        {prayer.visibility === 'ANONYMOUS'
                          ? 'Anonymous'
                          : prayer.author.displayName}
                      </CardDescription>
                      <CardTitle>{prayer.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {prayer.content.slice(0, 200)}
                        {prayer.content.length > 200 && '...'}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {new Date(prayer.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )}
                        </p>
                        {prayer.status === 'ANSWERED' && (
                          <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                            Answered
                          </span>
                        )}
                      </div>
                      <PrayButton
                        prayerRequestId={prayer.id}
                        initialCount={prayer.prayerCount}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </Reveal>
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
              &ldquo;Therefore confess your sins to each other and pray for each
              other so that you may be healed. The prayer of a righteous person is
              powerful and effective.&rdquo;
            </blockquote>
            <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
              — James 5:16
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
