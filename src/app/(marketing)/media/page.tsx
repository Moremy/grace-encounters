import type { Metadata } from 'next';
import Link from 'next/link';
import { Play, Headphones, Instagram, Youtube } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/brand/reveal';

export const metadata: Metadata = {
  title: 'Media',
  description:
    'Watch, listen, and connect with Grace Encounters through our YouTube channel, podcast, and social platforms.',
};

export default function MediaPage() {
  return (
    <>
      <section className="bg-ivory py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Media
          </p>
          <h1 className="mt-4 font-serif text-3xl md:text-4xl text-navy">
            Watch & Listen
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Sermons, testimonies, worship, and conversations. Wherever you are, the Word
            goes with you.
          </p>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="max-w-4xl mx-auto px-6">
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                    <Play className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-4">YouTube Channel</CardTitle>
                  <CardDescription>
                    Watch full sermons, testimony videos, and worship recordings from our
                    crusades and events.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Subscribe to stay updated with new video content each week. From
                    powerful testimonies to teaching series, our channel is a place to
                    encounter God through the screen.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="#youtube-channel">Visit YouTube Channel</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-4">Podcast</CardTitle>
                  <CardDescription>
                    Listen to conversations on faith, prayer, and walking with God in
                    everyday life.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    New episodes released weekly. Hear from pastors, missionaries, and
                    everyday believers sharing what God is teaching them in this season.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="#podcast">Listen to Podcast</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-ivory py-16">
        <div className="max-w-4xl mx-auto px-6">
          <Reveal>
            <h2 className="font-serif text-2xl text-navy text-center mb-8">
              Connect With Us
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href="#youtube-channel" className="flex items-center gap-2">
                  <Youtube className="h-4 w-4" />
                  YouTube
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="#podcast" className="flex items-center gap-2">
                  <Headphones className="h-4 w-4" />
                  Podcast
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="#instagram" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="#facebook" className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                  Facebook
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="#twitter" className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                  </svg>
                  X / Twitter
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
