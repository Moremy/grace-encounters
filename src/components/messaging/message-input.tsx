'use client';

import * as React from 'react';
import { Paperclip, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sendMessage } from '@/lib/messaging/actions';

interface MessageInputProps {
  conversationId: string;
}

export function MessageInput({ conversationId }: MessageInputProps) {
  const [content, setContent] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(conversationId, content.trim());
      setContent('');
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t border-border px-4 py-3"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        aria-label="Attach file"
      >
        <Paperclip className="h-4 w-4" />
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf,.doc,.docx"
      />
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <Button
        type="submit"
        variant="sacred"
        size="icon"
        disabled={!content.trim() || sending}
        aria-label="Send message"
        className="h-9 w-9 rounded-full"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
