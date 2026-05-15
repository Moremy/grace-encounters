'use client';

import * as React from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sendPrayerRoomMessage } from '@/lib/prayer-room/actions';

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  author: { displayName: string | null };
}

interface PrayerRoomChatProps {
  roomId: string;
  messages: Message[];
  currentUserId: string;
}

export function PrayerRoomChat({
  roomId,
  messages,
  currentUserId,
}: PrayerRoomChatProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [content, setContent] = React.useState('');

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content.trim()) return;
    await sendPrayerRoomMessage(roomId, content);
    setContent('');
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No messages yet. Start the conversation.
          </p>
        )}
        {messages.map((message) => (
          <div key={message.id} className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-navy text-sm">
                {message.author.displayName ?? 'Anonymous'}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(message.createdAt).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="text-sm">{message.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSubmit}
        className="border-t border-border/60 p-4 flex items-center gap-2"
      >
        <textarea
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          rows={1}
          maxLength={1000}
        />
        <Button type="submit" size="sm" className="bg-gold text-navy hover:bg-gold/90">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
