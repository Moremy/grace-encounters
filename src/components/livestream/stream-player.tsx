'use client';

import { Video } from 'lucide-react';

interface StreamPlayerProps {
  streamUrl: string | null;
  thumbnailUrl: string | null;
  title: string;
  isLive: boolean;
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
  );
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
  }

  // Vimeo
  const vimeoMatch = url.match(
    /(?:vimeo\.com\/)(\d+)/,
  );
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }

  // Direct URL (HLS or other)
  return null;
}

export function StreamPlayer({
  streamUrl,
  thumbnailUrl,
  title,
  isLive,
}: StreamPlayerProps) {
  if (!streamUrl || !isLive) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-navy-700">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover opacity-70"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Video className="h-16 w-16 text-ivory/40" />
          </div>
        )}
        {!isLive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <p className="text-lg font-medium text-ivory">
              Stream not currently live
            </p>
          </div>
        )}
      </div>
    );
  }

  const embedUrl = getEmbedUrl(streamUrl);

  if (embedUrl) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  // Fallback for direct video URLs (HLS, etc.)
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      <video
        src={streamUrl}
        controls
        autoPlay
        className="h-full w-full"
        aria-label={title}
      >
        Your browser does not support the video element.
      </video>
    </div>
  );
}
