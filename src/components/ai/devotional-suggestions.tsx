'use client';

import * as React from 'react';
import { Sparkles } from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { getDevotionalSuggestions } from '@/lib/ai/actions';
import type { DevotionalSuggestion } from '@/lib/ai/actions';

interface DevotionalSuggestionsProps {
  userId: string;
}

export function DevotionalSuggestions({ userId }: DevotionalSuggestionsProps) {
  const [suggestions, setSuggestions] = React.useState<DevotionalSuggestion[]>(
    [],
  );
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchSuggestions() {
      try {
        const results = await getDevotionalSuggestions(userId);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSuggestions();
  }, [userId]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gold" />
          <CardTitle className="text-lg">Recommended for You</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 w-1/2 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.theme}
                className="rounded-md border border-border/40 p-3"
              >
                <p className="font-serif text-sm font-semibold text-navy">
                  {suggestion.theme}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {suggestion.description}
                </p>
                <p className="mt-1 text-xs text-gold">
                  {suggestion.scriptureBase}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No suggestions available right now.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
