/**
 * Format a stream duration in seconds to a human-readable string.
 */
export function formatStreamDuration(seconds: number): string {
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
 * Get a human-readable label for a stream status.
 */
export function getStreamStatusLabel(
  status: 'SCHEDULED' | 'LIVE' | 'ENDED',
): string {
  const labels: Record<string, string> = {
    SCHEDULED: 'Scheduled',
    LIVE: 'Live',
    ENDED: 'Replay',
  };
  return labels[status] ?? status;
}

/**
 * Check if a stream is currently live.
 */
export function isStreamLive(status: string): boolean {
  return status === 'LIVE';
}
