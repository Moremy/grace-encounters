import Link from 'next/link';
import { ListMusic } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

interface PlaylistCardProps {
  playlist: {
    slug: string;
    title: string;
    coverImageUrl?: string | null;
    category: string;
    _count?: { items: number };
  };
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  const itemCount = playlist._count?.items ?? 0;

  return (
    <Link href={`/media?playlist=${playlist.slug}`} className="group block">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-square bg-gradient-to-br from-gold/20 to-navy/10">
          {playlist.coverImageUrl ? (
            <img
              src={playlist.coverImageUrl}
              alt={playlist.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ListMusic className="h-12 w-12 text-gold/40" />
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-serif text-base font-medium text-navy group-hover:text-gold transition-colors">
            {playlist.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
          <p className="mt-0.5 text-xs capitalize text-muted-foreground">
            {playlist.category.toLowerCase()}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
