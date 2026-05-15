import type { Metadata } from 'next';
import Link from 'next/link';
import { PenLine } from 'lucide-react';

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
  title: 'Blog',
  description:
    'Reflections, writings, and devotional thoughts from the Grace Encounters community.',
};

type BlogPost = {
  title: string;
  date: string;
  excerpt: string;
};

const posts: BlogPost[] = [
  {
    title: 'The Quiet Discipline of Waiting',
    date: 'January 12, 2025',
    excerpt:
      'In a season of silence, God is not absent. He is shaping something we cannot yet see. Waiting is not wasted time in His economy.',
  },
  {
    title: 'What Scripture Means by Rest',
    date: 'January 5, 2025',
    excerpt:
      'Rest in the biblical sense is not inactivity. It is the deep confidence that God finishes what He starts, and we can cease striving.',
  },
  {
    title: 'On Praying for Others',
    date: 'December 28, 2024',
    excerpt:
      'Intercession is quiet, costly, and powerful. When we carry another person before the throne, we participate in the ministry of Christ Himself.',
  },
  {
    title: 'Lessons from the Wilderness',
    date: 'December 20, 2024',
    excerpt:
      'The wilderness is not punishment. It is preparation. Every great calling passes through a season where provision comes from God alone.',
  },
];

export default function BlogPage() {
  return (
    <>
      <section className="bg-ivory py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Blog
          </p>
          <h1 className="mt-4 font-serif text-3xl md:text-4xl text-navy">
            Reflections & Writings
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Thoughtful meditations on scripture, prayer, and the Christian walk. Written
            slowly, offered freely.
          </p>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map(({ title, date, excerpt }) => (
                <Card key={title}>
                  <CardHeader>
                    <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                      <PenLine className="h-5 w-5" />
                    </div>
                    <CardDescription className="mt-4">{date}</CardDescription>
                    <CardTitle>{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{excerpt}</p>
                    <Button variant="link" className="mt-4 px-0" asChild>
                      <Link href="#">Read More</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Reveal>

          <div className="mt-16 text-center">
            <p className="font-serif italic text-muted-foreground">
              More posts coming soon. Stay rooted, stay expectant.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
