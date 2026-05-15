'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getDateLabel } from '@/lib/messaging/utils';

interface MessageItem {
  id: string;
  content: string;
  mediaUrl: string | null;
  mediaType: string | null;
  createdAt: Date | string;
  sender: {
    id: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

interface MessageThreadProps {
  messages: MessageItem[];
  currentUserId: string;
}

export function MessageThread({ messages, currentUserId }: MessageThreadProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Group messages by date
  const groupedMessages: { label: string; messages: MessageItem[] }[] = [];
  let currentLabel = '';

  for (const msg of messages) {
    const label = getDateLabel(msg.createdAt);
    if (label !== currentLabel) {
      currentLabel = label;
      groupedMessages.push({ label, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-2">
        <p className="text-sm text-muted-foreground">
          No messages yet. Send one to start the conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2">
      {groupedMessages.map((group) => (
        <div key={group.label}>
          {/* Date separator */}
          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted-foreground">{group.label}</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Messages */}
          {group.messages.map((msg) => {
            const isSent = msg.sender.id === currentUserId;
            const time = new Date(msg.createdAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            });

            return (
              <div
                key={msg.id}
                className={cn(
                  'mb-3 flex flex-col',
                  isSent ? 'items-end' : 'items-start',
                )}
              >
                {!isSent && (
                  <span className="mb-1 text-xs text-muted-foreground">
                    {msg.sender.displayName ?? 'Unknown'}
                  </span>
                )}
                <div
                  className={cn(
                    'max-w-[75%] rounded-xl px-4 py-2',
                    isSent
                      ? 'bg-navy text-white'
                      : 'bg-muted',
                  )}
                >
                  {msg.mediaUrl && msg.mediaType === 'IMAGE' && (
                    <div className="mb-2 overflow-hidden rounded-lg">
                      <Image
                        src={msg.mediaUrl}
                        alt="Shared image"
                        width={300}
                        height={200}
                        className="object-cover"
                      />
                    </div>
                  )}
                  {msg.mediaUrl && msg.mediaType === 'FILE' && (
                    <a
                      href={msg.mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mb-2 block text-sm underline"
                    >
                      Attached file
                    </a>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="mt-1 text-xs text-muted-foreground">
                  {time}
                </span>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
