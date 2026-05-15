import type { Metadata } from 'next';
import { Newspaper, Globe } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Reveal } from '@/components/brand/reveal';

export const metadata: Metadata = {
  title: 'Faith News & Updates',
  description:
    'Stay informed with the latest faith news, updates, and stories from around the world.',
};

type NewsItem = {
  source: string;
  headline: string;
  date: string;
  excerpt: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const newsItems: NewsItem[] = [
  {
    source: 'Ministry Today',
    headline: 'Revival Services See Record Attendance Across East Africa',
    date: 'January 15, 2025',
    excerpt:
      'Thousands gather for week-long crusade events as communities report renewed hunger for the gospel and miraculous testimonies.',
    Icon: Globe,
  },
  {
    source: 'Faith Wire',
    headline: 'New Bible Translation Reaches Remote Communities',
    date: 'January 10, 2025',
    excerpt:
      'A decade-long translation effort brings the full scripture to three previously unreached language groups.',
    Icon: Newspaper,
  },
  {
    source: 'Christian Post',
    headline: 'Youth Prayer Movement Grows in University Campuses',
    date: 'January 6, 2025',
    excerpt:
      'Student-led prayer gatherings are spreading organically across universities, with reports of healing and renewed faith.',
    Icon: Globe,
  },
  {
    source: 'Gospel Herald',
    headline: 'Churches Unite for City-Wide Day of Fasting and Prayer',
    date: 'December 30, 2024',
    excerpt:
      'Over fifty congregations join together to seek God for their city, setting aside denominational lines for a shared cause.',
    Icon: Newspaper,
  },
  {
    source: 'Missions Network',
    headline: 'Clean Water Project Opens Doors for Gospel in Rural Villages',
    date: 'December 22, 2024',
    excerpt:
      'Practical love meets spiritual hunger as communities receiving wells also welcome the message of living water.',
    Icon: Globe,
  },
  {
    source: 'Faith Daily',
    headline: 'Annual Scripture Reading Plan Reaches One Million Participants',
    date: 'December 18, 2024',
    excerpt:
      'A global reading initiative invites believers to journey through the entire Bible together in community.',
    Icon: Newspaper,
  },
];

export default function NewsPage() {
  return (
    <>
      <section className="bg-ivory py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            News & Papers
          </p>
          <h1 className="mt-4 font-serif text-3xl md:text-4xl text-navy">
            Faith News & Updates
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Stories of what God is doing around the world. Good news for those who watch
            and pray.
          </p>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsItems.map(({ source, headline, date, excerpt, Icon }) => (
                <Card key={headline}>
                  <CardHeader>
                    <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardDescription className="mt-4">{source} &middot; {date}</CardDescription>
                    <CardTitle>{headline}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{excerpt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
