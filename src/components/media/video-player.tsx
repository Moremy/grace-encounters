'use client';

import * as React from 'react';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
}

export function VideoPlayer({ src, poster, title, className }: VideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = React.useState(false);

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.play();
    setHasStarted(true);
  };

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-lg bg-navy',
        className,
      )}
    >
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          title={title}
          controls={hasStarted}
          className="h-full w-full object-cover"
          preload="metadata"
          onPlay={() => setHasStarted(true)}
        />

        {!hasStarted && (
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40"
            aria-label="Play video"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold text-navy transition-transform hover:scale-110">
              <Play className="h-7 w-7 ml-1" />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
