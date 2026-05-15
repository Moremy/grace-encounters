'use client';

import * as React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  defaultValue?: string;
  onSearch?: (query: string) => void;
  variant?: 'full' | 'compact';
}

export function SearchBar({ defaultValue = '', onSearch, variant = 'full' }: SearchBarProps) {
  const [value, setValue] = React.useState(defaultValue);
  const [loading, setLoading] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  function handleChange(newValue: string) {
    setValue(newValue);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!newValue.trim()) {
      onSearch?.('');
      return;
    }

    setLoading(true);
    timeoutRef.current = setTimeout(() => {
      onSearch?.(newValue.trim());
      setLoading(false);
    }, 300);
  }

  function handleClear() {
    setValue('');
    onSearch?.('');
  }

  return (
    <div
      className={cn(
        'relative',
        variant === 'full' ? 'w-full' : 'w-64',
      )}
    >
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search..."
        className={cn(
          'w-full rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring',
          variant === 'full' ? 'py-3 pl-10 pr-16' : 'py-2 pl-10 pr-10',
        )}
      />
      <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        {value && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded p-0.5 hover:bg-muted"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
        {!value && !loading && variant === 'full' && (
          <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground sm:inline-block">
            Cmd+K
          </kbd>
        )}
      </div>
    </div>
  );
}
