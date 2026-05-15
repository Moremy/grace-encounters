import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart, Users } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/brand/reveal';

export const metadata: Metadata = {
  title: 'Community',
  description:
    'Join a community of believers sharing testimonies, lifting prayers, and walking together in faith.',
};

export default function CommunityPage() {
  return (
    <>
      <section className="bg-ivory py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Community
          </p>
          <h1 className="mt-4 font-serif text-3xl md:text-4xl text-navy">
            Join Our Community
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            A place of fellowship, encouragement, and shared faith. You were not meant to
            walk alone.
          </p>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="max-w-3xl mx-auto px-6">
          <Reveal>
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                  <Heart className="h-5 w-5" />
                </div>
                <CardTitle className="mt-4 font-serif text-2xl text-navy">
                  Fellowship & Connection
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  The Grace Encounters community is a gathering place for believers who long
                  for authentic connection. Here, testimonies are shared without pretense,
                  prayers are offered with genuine care, and every story is honored as a
                  witness to God&apos;s faithfulness.
                </p>
                <p className="text-muted-foreground">
                  We are building something beautiful and unhurried. A space where the body
                  of Christ can encourage one another, bear each other&apos;s burdens, and
                  celebrate what God is doing in the quiet and the extraordinary moments of
                  life.
                </p>
                <div className="pt-4">
                  <Button variant="sacred" asChild>
                    <Link href="/sign-up">Join the Community</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-4">Share Testimonies</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Tell what God has done in your life. Your story may be the spark of hope
                    someone else is waiting for.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                    <Heart className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-4">Pray Together</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Lift up requests, intercede for others, and experience the power of
                    agreement in prayer.
                  </p>
                </CardContent>
              </Card>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
