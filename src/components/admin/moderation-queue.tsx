'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Flag } from 'lucide-react';
import {
  approveContent,
  rejectContent,
  flagContent,
} from '@/lib/admin/moderation';
interface SerializedModerationItem {
  id: string;
  type: 'testimony' | 'prayer';
  title: string;
  content: string;
  authorName: string | null;
  authorId: string;
  status: string;
  createdAt: string;
}

interface ModerationQueueProps {
  items: SerializedModerationItem[];
  showActions?: boolean;
}

export function ModerationQueue({
  items,
  showActions = true,
}: ModerationQueueProps) {
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  async function handleApprove(item: SerializedModerationItem) {
    setProcessingId(item.id);
    try {
      await approveContent(item.type, item.id);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(item: SerializedModerationItem) {
    setProcessingId(item.id);
    try {
      await rejectContent(item.type, item.id, 'Content does not meet guidelines');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleFlag(item: SerializedModerationItem) {
    setProcessingId(item.id);
    try {
      await flagContent(item.type, item.id, 'Flagged for further review');
    } finally {
      setProcessingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Moderation Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No pending items to review.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          Moderation Queue
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {items.length} item{items.length !== 1 ? 's' : ''} pending review
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 rounded-md border border-border/60 p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase">
                    {item.type}
                  </span>
                  <p className="truncate text-sm font-medium">{item.title}</p>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  by {item.authorName ?? 'Unknown'} &middot;{' '}
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
                {item.content && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {item.content}
                  </p>
                )}
              </div>
              {showActions && (
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                    onClick={() => handleApprove(item)}
                    disabled={processingId === item.id}
                    aria-label="Approve"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleReject(item)}
                    disabled={processingId === item.id}
                    aria-label="Reject"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                    onClick={() => handleFlag(item)}
                    disabled={processingId === item.id}
                    aria-label="Flag for review"
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
