import type { Metadata } from 'next';
import { BookOpen, Library, Bookmark, Scroll, BookMarked, Sparkles } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Reveal } from '@/components/brand/reveal';

export const metadata: Metadata = {
  title: 'Books & Recommendations',
  description:
    'Curated books and resources to renew your mind through the written word. Faith-building reads recommended by the Grace Encounters community.',
};

type BookItem = {
  title: string;
  author: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const books: BookItem[] = [
  {
    title: 'Knowing God',
    author: 'J.I. Packer',
    description:
      'A timeless exploration of the character of God and what it means to truly know Him.',
    Icon: BookOpen,
  },
  {
    title: 'The Pursuit of God',
    author: 'A.W. Tozer',
    description:
      'A soul-stirring call to draw near to the heart of the Father with holy longing.',
    Icon: Library,
  },
  {
    title: 'Mere Christianity',
    author: 'C.S. Lewis',
    description:
      'A brilliant and accessible defense of the Christian faith for seekers and believers alike.',
    Icon: Bookmark,
  },
  {
    title: 'The Hiding Place',
    author: 'Corrie ten Boom',
    description:
      'A testimony of courage, forgiveness, and the sustaining power of faith in the darkest hour.',
    Icon: Scroll,
  },
  {
    title: 'Disciplines of a Godly Man',
    author: 'R. Kent Hughes',
    description:
      'Practical wisdom for cultivating spiritual habits that strengthen the soul.',
    Icon: BookMarked,
  },
  {
    title: 'Hinds Feet on High Places',
    author: 'Hannah Hurnard',
    description:
      'An allegorical journey of faith, surrender, and the path to the high places with the Shepherd.',
    Icon: Sparkles,
  },
];

export default function BooksPage() {
  return (
    <>
      <section className="bg-ivory py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Books & Recommendations
          </p>
          <h1 className="mt-4 font-serif text-3xl md:text-4xl text-navy">
            Renew your mind through the written word.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            A curated shelf of books that have shaped our faith, deepened our prayer life,
            and drawn us closer to the heart of God.
          </p>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map(({ title, author, description, Icon }) => (
                <Card key={title}>
                  <CardHeader>
                    <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="mt-4">{title}</CardTitle>
                    <CardDescription>by {author}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
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
              &ldquo;Your word is a lamp to my feet and a light to my path.&rdquo;
            </blockquote>
            <p className="mt-6 text-xs uppercase tracking-widest text-muted-foreground">
              — Psalm 119:105
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
