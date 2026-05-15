'use client';

import * as React from 'react';
import { BookOpen } from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { getScriptureRecommendations } from '@/lib/ai/actions';
import type { ScriptureVerse } from '@/lib/ai/actions';

export function ScriptureRecommendations() {
  const [verses, setVerses] = React.useState<ScriptureVerse[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRecommendations() {
      try {
        const results = await getScriptureRecommendations(
          'Looking for encouragement and guidance for today',
        );
        setVerses(results);
      } catch {
        setVerses([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, []);

  return (
    <Card className="border-l-4 border-l-gold">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-gold" />
          <CardTitle className="text-lg">Scripture for You</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 w-1/3 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : verses.length > 0 ? (
          <div className="space-y-4">
            {verses.map((verse) => (
              <div key={verse.reference} className="space-y-1">
                <p className="font-serif text-sm font-semibold text-navy">
                  {verse.reference}
                </p>
                <p className="text-sm italic text-muted-foreground">
                  &ldquo;{verse.text}&rdquo;
                </p>
                <p className="text-xs text-muted-foreground">
                  {verse.relevance}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No scripture recommendations available right now.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
