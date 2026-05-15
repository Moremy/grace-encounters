import Link from 'next/link';
import { Video, Clock, Radio } from 'lucide-react';
import { getStreamStatusLabel } from '@/lib/livestream/utils';

interface StreamCardProps {
  slug: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED';
  scheduledAt: Date | string | null;
  streamType: string;
}

export function StreamCard({
  slug,
  title,
  description,
  thumbnailUrl,
  status,
  scheduledAt,
  streamType,
}: StreamCardProps) {
  const statusLabel = getStreamStatusLabel(status);

  const statusColors: Record<string, string> = {
    SCHEDULED: 'bg-navy/10 text-navy',
    LIVE: 'bg-red-500/15 text-red-600',
    ENDED: 'bg-muted text-muted-foreground',
  };

  return (
    <Link
      href={`/live/${slug}`}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-video overflow-hidden bg-navy-700">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Video className="h-12 w-12 text-ivory/40" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[status] ?? statusColors.ENDED}`}
          >
            {status === 'LIVE' && <Radio className="h-3 w-3 animate-pulse" />}
            {statusLabel}
          </span>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gold mb-1">
          {streamType}
        </p>
        <h3 className="font-serif text-lg text-navy line-clamp-1 group-hover:text-gold transition-colors">
          {title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
        {scheduledAt && status === 'SCHEDULED' && (
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {new Date(scheduledAt).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
