'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  author: {
    displayName: string | null;
    avatarUrl: string | null;
  };
}

interface StreamChatProps {
  streamId: string;
  isLive: boolean;
}

export function StreamChat({ streamId, isLive }: StreamChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastTimestampRef = useRef<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const params = new URLSearchParams({ streamId });
      if (lastTimestampRef.current) {
        params.set('after', lastTimestampRef.current);
      }
      const res = await fetch(`/api/livestream/chat?${params.toString()}`);
      if (!res.ok) return;
      const data = (await res.json()) as ChatMessage[];
      if (data.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMessages = data.filter((m) => !existingIds.has(m.id));
          return [...prev, ...newMessages];
        });
        lastTimestampRef.current = data[data.length - 1].createdAt;
      }
    } catch {
      // Silently handle network errors
    }
  }, [streamId]);

  useEffect(() => {
    fetchMessages();
    if (!isLive) return;

    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages, isLive]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      await fetch('/api/livestream/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId, content: trimmed }),
      });
      setInput('');
      await fetchMessages();
    } catch {
      // Handle error silently
    } finally {
      setSending(false);
    }
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-navy">Live Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            {isLive ? 'No messages yet. Say hello!' : 'Chat is not available.'}
          </p>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-navy text-xs font-medium text-ivory">
              {(msg.author.displayName ?? 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-medium text-navy truncate">
                  {msg.author.displayName ?? 'Anonymous'}
                </span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
              <p className="text-sm text-foreground break-words">
                {msg.content}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {isLive && (
        <form
          onSubmit={handleSend}
          className="border-t border-border px-4 py-3 flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            maxLength={500}
            disabled={sending}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            variant="sacred"
            disabled={sending || !input.trim()}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
  );
}
