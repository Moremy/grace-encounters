import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, HeartHandshake, Globe, Compass, Sparkles, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/brand/reveal';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Light Bearers exists to shine truth and walk with people as God transforms them. Learn our vision, mission, and what we believe.',
};

const values = [
  {
    title: 'Scripture First',
    description:
      'The Bible is our anchor. Every teaching, prayer, and testimony is weighed against the Word.',
    Icon: BookOpen,
  },
  {
    title: 'Prayerful Care',
    description:
      'We move at the pace of prayer. Stories are read prayerfully and published with care.',
    Icon: HeartHandshake,
  },
  {
    title: 'Quiet Reverence',
    description:
      'A reverent home — not loud, not performative. A place to breathe and meet God.',
    Icon: Sparkles,
  },
  {
    title: 'Whole Community',
    description:
      'Discipleship happens together. We grow in shared prayer, study, and service.',
    Icon: Users,
  },
  {
    title: 'Honest Witness',
    description:
      'Real testimonies from real lives. We tell the truth — including the hard parts.',
    Icon: Compass,
  },
  {
    title: 'Beyond Our Doorstep',
    description:
      'Carrying the message of truth far beyond our own community, near and far.',
    Icon: Globe,
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-ivory py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            About Light Bearers
          </p>
          <h1 className="mt-4 font-serif text-4xl text-burgundy md:text-5xl">
            Shining Truth. Transforming Lives.
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-muted-foreground">
            Light Bearers gathers testimonies, prayer, and daily devotion into one
            reverent space. We exist to shine truth into everyday life and to walk
            alongside people as God transforms them.
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
              Our Vision
            </span>
            <span className="h-px w-12 bg-teal" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-serif text-3xl text-burgundy md:text-4xl">
            A world quietly transformed by the truth of Christ.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            We long to see lives renewed in every corner — homes restored, communities
            healed, and a generation that knows the steady, sustaining presence of God.
            Not through noise or spectacle, but through truth held faithfully and shared
            generously, one life at a time.
          </p>
          <blockquote className="mt-8 border-l-4 border-gold pl-6 italic text-navy/70">
            &ldquo;You are the light of the world. A town built on a hill cannot be
            hidden.&rdquo;
            <cite className="mt-2 block text-sm not-italic text-muted-foreground">
              &mdash; Matthew 5:14
            </cite>
          </blockquote>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
              Our Mission
            </span>
            <span className="h-px w-12 bg-teal" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-serif text-3xl text-burgundy md:text-4xl">
            To shine truth, gather the church in prayer, and walk with people as God
            transforms them.
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="font-serif text-lg font-semibold text-burgundy">Shine</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Publish faithful teaching, devotionals, and testimonies that point clearly
                to Christ.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-burgundy">Gather</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Hold a steady place for prayer, scripture, and shared life — online and
                in person.
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-burgundy">Walk</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Stand alongside people through counsel, community, and care as God
                does His slow, good work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Believe / Values */}
      <section className="bg-ivory/50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
              What We Hold To
            </p>
            <h2 className="mt-4 font-serif text-3xl text-burgundy md:text-4xl">
              The convictions that shape every page.
            </h2>
            <p className="mt-4 text-muted-foreground">
              These aren&apos;t slogans. They&apos;re the quiet rules that govern what we
              publish, how we pray, and how we treat the people who entrust us with their
              stories.
            </p>
          </div>

          <Reveal>
            <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {values.map(({ title, description, Icon }) => (
                <div key={title}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-semibold text-burgundy">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Story */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
              Our Story
            </span>
            <span className="h-px w-12 bg-teal" aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-serif text-3xl text-burgundy md:text-4xl">
            Built slowly. Kept gently.
          </h2>
          <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Light Bearers began as a small gathering of believers who wanted somewhere
              honest to share what God was doing — without the noise. What started as a
              handful of testimonies and a weekly prayer call has grown into a wider
              ministry of devotionals, teaching, counsel, and community.
            </p>
            <p>
              We are not in a hurry. The kingdom is built one faithful life at a time, and
              we&apos;d rather move slowly and tell the truth than move fast and lose it.
            </p>
            <p>
              Everything you find here — every testimony, every devotional, every prayer
              request — passes through prayerful hands before it reaches yours.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-burgundy py-20 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl">Walk with us.</h2>
          <p className="mt-4 text-white/80">
            Join the prayer wall, read today&apos;s devotional, or support the ministry as
            God leads.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-[#1A6B6B] text-white hover:bg-[#1A6B6B]/90">
              <Link href="/donate">Give Today</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white bg-transparent text-white hover:bg-white hover:text-burgundy"
            >
              <Link href="/prayer-wall">Visit Prayer Wall</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
