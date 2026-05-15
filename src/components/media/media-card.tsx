import Link from 'next/link';
import { Play, Music, FileText, Video } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { formatDuration, getMediaTypeLabel } from '@/lib/media/utils';

interface MediaCardProps {
  media: {
    slug: string;
    title: string;
    description: string;
    mediaType: string;
    thumbnailUrl?: string | null;
    duration?: number | null;
    category: string;
    speaker?: { displayName: string | null } | null;
  };
}

function getMediaIcon(type: string) {
  switch (type) {
    case 'SERMON_AUDIO':
    case 'WORSHIP_AUDIO':
      return Music;
    case 'SERMON_VIDEO':
    case 'VIDEO_MESSAGE':
      return Video;
    case 'PDF_RESOURCE':
      return FileText;
    default:
      return Play;
  }
}

export function MediaCard({ media }: MediaCardProps) {
  const Icon = getMediaIcon(media.mediaType);

  return (
    <Link href={`/media/${media.slug}`} className="group block">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        {/* Thumbnail Area */}
        <div className="relative aspect-video bg-gradient-to-br from-navy to-navy/80">
          {media.thumbnailUrl ? (
            <img
              src={media.thumbnailUrl}
              alt={media.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Icon className="h-12 w-12 text-gold/40" />
            </div>
          )}

          {/* Type Badge */}
          <span className="absolute right-2 top-2 rounded-full bg-navy/80 px-2 py-0.5 text-xs font-medium text-ivory">
            {getMediaTypeLabel(media.mediaType)}
          </span>

          {/* Duration */}
          {media.duration && (
            <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
              {formatDuration(media.duration)}
            </span>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-serif text-base font-medium text-navy line-clamp-2 group-hover:text-gold transition-colors">
            {media.title}
          </h3>
          {media.speaker?.displayName && (
            <p className="mt-1 text-sm text-muted-foreground">
              {media.speaker.displayName}
            </p>
          )}
          <p className="mt-1 text-xs capitalize text-muted-foreground">
            {media.category.toLowerCase()}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
