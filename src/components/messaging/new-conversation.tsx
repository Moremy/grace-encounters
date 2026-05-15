'use client';

import * as React from 'react';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { searchUsers, createDirectConversation, createGroupConversation } from '@/lib/messaging/actions';

interface UserResult {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  email: string;
}

interface NewConversationProps {
  onConversationCreated?: (id: string) => void;
}

export function NewConversation({ onConversationCreated }: NewConversationProps) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<UserResult[]>([]);
  const [selectedUsers, setSelectedUsers] = React.useState<UserResult[]>([]);
  const [groupTitle, setGroupTitle] = React.useState('');
  const [searching, setSearching] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const searchTimeout = React.useRef<NodeJS.Timeout | null>(null);

  function handleSearchChange(value: string) {
    setQuery(value);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (value.length < 1) {
      setResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const users = await searchUsers(value);
        setResults(users);
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  function selectUser(user: UserResult) {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setQuery('');
    setResults([]);
  }

  function removeUser(userId: string) {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  }

  async function handleStartConversation() {
    if (selectedUsers.length === 0 || creating) return;

    setCreating(true);
    try {
      let result;
      if (selectedUsers.length === 1) {
        result = await createDirectConversation(selectedUsers[0].id);
      } else {
        const title = groupTitle.trim() || 'Group Chat';
        result = await createGroupConversation(
          title,
          selectedUsers.map((u) => u.id),
        );
      }

      if (result && 'conversationId' in result && result.conversationId) {
        onConversationCreated?.(result.conversationId);
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Selected users chips */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <span
              key={user.id}
              className="inline-flex items-center gap-1 rounded-full bg-navy/10 px-3 py-1 text-xs font-medium"
            >
              {user.displayName ?? user.email}
              <button
                type="button"
                onClick={() => removeUser(user.id)}
                className="ml-1 rounded-full hover:bg-navy/20"
                aria-label={`Remove ${user.displayName ?? user.email}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Group title input (shown when 2+ participants) */}
      {selectedUsers.length >= 2 && (
        <input
          type="text"
          value={groupTitle}
          onChange={(e) => setGroupTitle(e.target.value)}
          placeholder="Group title (optional)"
          className="rounded-md border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )}

      {/* User search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search users by name or email..."
          className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Search results */}
      {searching && (
        <p className="text-xs text-muted-foreground">Searching...</p>
      )}
      {results.length > 0 && (
        <div className="flex flex-col divide-y divide-border rounded-md border border-border">
          {results.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => selectUser(user)}
              className="flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-medium text-ivory">
                {(user.displayName ?? user.email).charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {user.displayName ?? 'Unknown'}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Start conversation button */}
      {selectedUsers.length > 0 && (
        <Button
          variant="sacred"
          onClick={handleStartConversation}
          disabled={creating}
        >
          {creating ? 'Creating...' : 'Start Conversation'}
        </Button>
      )}
    </div>
  );
}
