'use client';

import * as React from 'react';
import { Search, Sparkles } from 'lucide-react';

import { enhanceSearch } from '@/lib/ai/actions';
import { globalSearch } from '@/lib/search/actions';

interface SearchResult {
  type: string;
  title: string;
  excerpt: string;
  url: string;
  date: string;
}

export function SmartSearch() {
  const [query, setQuery] = React.useState('');
  const [expandedTerms, setExpandedTerms] = React.useState<string[]>([]);
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = React.useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setResults([]);
      setExpandedTerms([]);
      return;
    }

    setLoading(true);

    try {
      // Run AI enhancement and search in parallel
      const [enhancement, searchResults] = await Promise.all([
        enhanceSearch(searchQuery),
        globalSearch(searchQuery),
      ]);

      setExpandedTerms(enhancement.expandedTerms);
      setResults(searchResults);
    } catch {
      setResults([]);
      setExpandedTerms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search with AI-enhanced suggestions..."
          className="w-full rounded-md border border-border bg-background px-9 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50"
        />
        {expandedTerms.length > 0 && (
          <Sparkles className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />
        )}
      </div>

      {expandedTerms.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {expandedTerms.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setQuery(term);
                handleSearch(term);
              }}
              className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-navy transition-colors hover:bg-gold/20"
            >
              {term}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-1">
              <div className="h-4 w-2/3 rounded bg-muted" />
              <div className="h-3 w-full rounded bg-muted" />
            </div>
          ))}
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-2">
          {results.slice(0, 10).map((result, index) => (
            <a
              key={`${result.url}-${index}`}
              href={result.url}
              className="block rounded-md border border-border/40 p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <span className="rounded bg-navy/10 px-2 py-0.5 text-xs font-medium text-navy">
                  {result.type}
                </span>
                <span className="text-sm font-medium">{result.title}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {result.excerpt}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
