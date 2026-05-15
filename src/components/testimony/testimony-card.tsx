import * as React from 'react';
import Link from 'next/link';
import { FileText, Headphones, Play, BookHeart } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TestimonyCardProps {
  testimony: {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    mediaType: string;
    category: string | null;
    author: { displayName: string | null };
  };
}

const MEDIA_ICONS: Record<string, React.ReactNode> = {
  TEXT: <BookHeart className="h-5 w-5" />,
  PDF: <FileText className="h-5 w-5" />,
  AUDIO: <Headphones className="h-5 w-5" />,
  VIDEO: <Play className="h-5 w-5" />,
};

function getCategoryLabel(category: string | null): string | null {
  if (!category) return null;
  return category.charAt(0) + category.slice(1).toLowerCase();
}

export function TestimonyCard({ testimony }: TestimonyCardProps) {
  const icon = MEDIA_ICONS[testimony.mediaType] ?? MEDIA_ICONS.TEXT;
  const categoryLabel = getCategoryLabel(testimony.category);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold">
            {icon}
          </div>
          {categoryLabel && (
            <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-medium text-gold">
              {categoryLabel}
            </span>
          )}
        </div>
        <CardDescription className="mt-4">
          {testimony.author.displayName}
        </CardDescription>
        <CardTitle>{testimony.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{testimony.excerpt}</p>
        <Button variant="link" className="mt-4 px-0" asChild>
          <Link href={`/testimonies/${testimony.slug}`}>Read More</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
