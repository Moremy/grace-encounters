import Link from 'next/link';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const categoryLabels: Record<string, string> = {
  DEVOTIONAL_THOUGHT: 'Devotional Thought',
  FAITH_LIVING: 'Faith Living',
  TESTIMONY_REFLECTION: 'Testimony Reflection',
  CHURCH_NEWS: 'Church News',
  MISSIONS: 'Missions',
  PRAYER: 'Prayer',
};

type ArticleCardProps = {
  article: {
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    publishDate: Date | null;
    author: { displayName: string };
  };
};

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card>
      <CardHeader>
        <span className="inline-block w-fit rounded-full bg-gold/15 text-gold px-2 py-0.5 text-xs font-medium">
          {categoryLabels[article.category] ?? article.category}
        </span>
        <CardTitle className="mt-2 font-serif text-lg text-navy">
          {article.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {article.excerpt}
        </p>
        <CardDescription className="mt-3">
          {article.author.displayName}
          {article.publishDate && (
            <>
              {' '}
              &middot;{' '}
              {new Date(article.publishDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </>
          )}
        </CardDescription>
        <Button variant="link" className="mt-4 px-0" asChild>
          <Link href={`/blog/${article.slug}`}>Read More</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
