'use client';

import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaPlayerProps {
  mediaType: 'AUDIO' | 'VIDEO' | 'PDF';
  mediaUrl: string;
  title: string;
}

export function MediaPlayer({ mediaType, mediaUrl, title }: MediaPlayerProps) {
  if (mediaType === 'AUDIO') {
    return (
      <div className="rounded-lg border border-gold/30 bg-ivory/50 p-4">
        <p className="mb-3 text-sm font-medium text-navy">{title}</p>
        <audio controls className="w-full" preload="metadata">
          <source src={mediaUrl} />
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  if (mediaType === 'VIDEO') {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-lg border border-navy/10">
        <video controls className="h-full w-full" preload="metadata">
          <source src={mediaUrl} />
          Your browser does not support the video element.
        </video>
      </div>
    );
  }

  if (mediaType === 'PDF') {
    return (
      <div className="flex items-center gap-4 rounded-lg border border-navy/10 bg-ivory/50 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gold/15">
          <FileText className="h-6 w-6 text-gold" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-navy">{title}</p>
          <p className="text-xs text-muted-foreground">PDF Document</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={mediaUrl} target="_blank" rel="noopener noreferrer">
            <Download className="mr-2 h-4 w-4" />
            View PDF
          </a>
        </Button>
      </div>
    );
  }

  return null;
}
