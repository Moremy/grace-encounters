import type { Metadata } from 'next';
import {
  BookOpen,
  Library,
  Bookmark,
  Scroll,
  BookMarked,
  Sparkles,
  Compass,
  FileText,
  ExternalLink,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/brand/reveal';
import { getPublishedBooks } from '@/lib/book/actions';

export const metadata: Metadata = {
  title: 'Books & Recommendations',
  description:
    'Curated books and resources to renew your mind through the written word. Faith-building reads recommended by the Light Bearers community.',
};

export const revalidate = 300;

type BookItem = {
  title: string;
  author: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  /** Link to a legally free full text (public domain only). */
  freeUrl?: string;
};

const classics: BookItem[] = [
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
    freeUrl: 'https://www.gutenberg.org/ebooks/25141',
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
  {
    title: 'The Purpose Driven Life',
    author: 'Rick Warren',
    description:
      'A 40-day spiritual journey answering the question every heart asks: What on earth am I here for?',
    Icon: Compass,
  },
];

export default async function BooksPage() {
  const books = await getPublishedBooks();

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

      {books.length > 0 && (
        <section className="bg-background py-24">
          <div className="max-w-6xl mx-auto px-6">
            <Reveal>
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  From the Ministry
                </p>
                <h2 className="mt-3 font-serif text-2xl md:text-3xl text-navy">
                  Our Library
                </h2>
                <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
                  Books shared by the ministry — read them right here, or follow
                  the links to find them.
                </p>
              </div>
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => (
                  <Card key={book.id} className="flex flex-col">
                    <CardHeader>
                      <div className="h-10 w-10 rounded-full bg-gold/15 text-gold flex items-center justify-center">
                        {book.fileUrl ? (
                          <FileText className="h-5 w-5" />
                        ) : (
                          <BookOpen className="h-5 w-5" />
                        )}
                      </div>
                      <CardTitle className="mt-4">{book.title}</CardTitle>
                      <CardDescription>by {book.author}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                      <p className="text-sm text-muted-foreground">
                        {book.description}
                      </p>
                      {(book.fileUrl || book.externalUrl) && (
                        <div className="mt-auto flex flex-wrap gap-3 pt-6">
                          {book.fileUrl && (
                            <Button asChild variant="sacred" size="sm">
                              <a
                                href={book.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Read Book
                              </a>
                            </Button>
                          )}
                          {book.externalUrl && (
                            <Button asChild variant="outline" size="sm">
                              <a
                                href={book.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Learn More
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section className={`${books.length > 0 ? 'bg-ivory' : 'bg-background'} py-24`}>
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Recommended Reads
              </p>
              <h2 className="mt-3 font-serif text-2xl md:text-3xl text-navy">
                Classics That Shaped Us
              </h2>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classics.map(({ title, author, description, Icon, freeUrl }) => (
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
                    {freeUrl && (
                      <div className="pt-6">
                        <Button asChild variant="outline" size="sm">
                          <a href={freeUrl} target="_blank" rel="noopener noreferrer">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Read Free
                          </a>
                        </Button>
                      </div>
                    )}
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
