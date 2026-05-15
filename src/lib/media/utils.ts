/**
 * Format a duration in seconds to MM:SS or HH:MM:SS.
 */
export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');

  if (hrs > 0) {
    const hh = String(hrs).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  return `${mm}:${ss}`;
}

/**
 * Get a human-readable label for a media type enum value.
 */
export function getMediaTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    SERMON_AUDIO: 'Sermon Audio',
    SERMON_VIDEO: 'Sermon Video',
    WORSHIP_AUDIO: 'Worship Audio',
    VIDEO_MESSAGE: 'Video Message',
    PDF_RESOURCE: 'PDF Resource',
  };
  return labels[type] ?? type;
}

/**
 * Converts a title into a URL-safe slug with a random suffix for uniqueness.
 */
export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const suffix = Math.random().toString(36).substring(2, 8);

  return `${base}-${suffix}`;
}
