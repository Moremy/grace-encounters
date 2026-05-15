'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/messaging/utils';

interface Participant {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

interface ConversationItem {
  id: string;
  type: string;
  title: string | null;
  otherParticipants: Participant[];
  lastMessage: {
    content: string;
    createdAt: Date | string;
    senderName: string | null;
  } | null;
  unreadCount: number;
}

interface ConversationListProps {
  conversations: ConversationItem[];
  activeId?: string;
}

export function ConversationList({ conversations, activeId }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground">
          No conversations yet. Start a new message to connect with someone.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {conversations.map((conversation) => {
        const name =
          conversation.type === 'GROUP'
            ? conversation.title ?? 'Group Chat'
            : conversation.otherParticipants[0]?.displayName ?? 'Unknown';

        const preview = conversation.lastMessage
          ? conversation.lastMessage.content.slice(0, 50) +
            (conversation.lastMessage.content.length > 50 ? '...' : '')
          : 'No messages yet';

        const timestamp = conversation.lastMessage
          ? formatRelativeTime(conversation.lastMessage.createdAt)
          : '';

        return (
          <Link
            key={conversation.id}
            href={`/messages/${conversation.id}`}
            className={cn(
              'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted',
              activeId === conversation.id && 'bg-muted',
            )}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {conversation.type === 'GROUP' ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-xs font-medium text-ivory">
                  {(conversation.title ?? 'G').charAt(0).toUpperCase()}
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-xs font-medium text-ivory">
                  {(conversation.otherParticipants[0]?.displayName ?? 'U')
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">{name}</span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {timestamp}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{preview}</p>
            </div>

            {/* Unread badge */}
            {conversation.unreadCount > 0 && (
              <div className="flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-gold" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
