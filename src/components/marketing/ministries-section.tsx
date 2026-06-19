import * as React from 'react';
import Link from 'next/link';
import { BookOpen, HandHeart, Mic, Users, ArrowRight } from 'lucide-react';

type Ministry = {
  title: string;
  description: string;
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const ministries: Ministry[] = [
  {
    title: 'Discipleship & Teaching',
    description: 'Grounding believers in Scripture through study, devotionals, and sound teaching.',
    href: '/devotionals',
    Icon: BookOpen,
  },
  {
    title: 'Community Outreach',
    description: 'Meeting practical needs and sharing hope with the people around us.',
    href: '/community',
    Icon: HandHeart,
  },
  {
    title: 'Podcast & Media',
    description: 'Sermons, stories, and conversations that carry truth wherever you are.',
    href: '/media',
    Icon: Mic,
  },
  {
    title: 'Mentorship Program',
    description: 'Walking with people one-on-one as they grow in faith and character.',
    href: '/dashboard/counselling/new',
    Icon: Users,
  },
];

export function MinistriesSection() {
  return (
    <section id="ministries" className="scroll-mt-20 bg-cream py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
            What We Do
          </span>
          <span className="h-px w-12 bg-teal" aria-hidden="true" />
        </div>

        <h2 className="mt-4 font-serif text-3xl text-burgundy md:text-4xl">Our Ministries</h2>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ministries.map(({ title, description, href, Icon }) => (
            <div
              key={title}
              className="flex flex-col rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-serif text-lg font-semibold text-burgundy">{title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{description}</p>
              <Link
                href={href}
                className="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-teal transition-colors hover:text-teal-700"
              >
                Learn More
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
