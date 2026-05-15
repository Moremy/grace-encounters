import { HandHeart, MessageCircle } from 'lucide-react';

interface Discussion {
  id: string;
  title: string;
  isPrayerThread: boolean;
  createdAt: Date;
  author: { displayName: string | null };
  _count: { replies: number };
}

interface DiscussionListProps {
  discussions: Discussion[];
}

function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function DiscussionList({ discussions }: DiscussionListProps) {
  if (discussions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No discussions yet. Start one below!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {discussions.map((discussion) => (
        <div
          key={discussion.id}
          className="rounded-md border border-border p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-navy truncate">
                  {discussion.title}
                </h3>
                {discussion.isPrayerThread && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 text-gold px-2 py-0.5 text-xs">
                    <HandHeart className="h-3 w-3" />
                    Prayer
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {discussion.author.displayName ?? 'Anonymous'} &middot;{' '}
                {timeAgo(discussion.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
              <MessageCircle className="h-4 w-4" />
              <span>{discussion._count.replies}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
