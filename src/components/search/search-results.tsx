'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  BookHeart,
  Sun,
  FileText,
  Users,
  Calendar,
  Play,
  Headphones,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  type: string;
  title: string;
  excerpt: string;
  url: string;
  date: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  activeType: string;
  query: string;
}

const typeConfig: Record<
  string,
  { label: string; icon: React.ElementType }
> = {
  testimonies: { label: 'Testimonies', icon: BookHeart },
  devotionals: { label: 'Devotionals', icon: Sun },
  blog: { label: 'Blog', icon: FileText },
  groups: { label: 'Groups', icon: Users },
  events: { label: 'Events', icon: Calendar },
  media: { label: 'Media', icon: Play },
  sermons: { label: 'Sermons', icon: Headphones },
};

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'testimonies', label: 'Testimonies' },
  { key: 'devotionals', label: 'Devotionals' },
  { key: 'blog', label: 'Blog' },
  { key: 'groups', label: 'Groups' },
  { key: 'events', label: 'Events' },
  { key: 'media', label: 'Media' },
  { key: 'sermons', label: 'Sermons' },
];

export function SearchResults({ results, activeType, query }: SearchResultsProps) {
  const filteredResults =
    activeType === 'all'
      ? results
      : results.filter((r) => r.type === activeType);

  return (
    <div className="space-y-6">
      {/* Type filter tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/search?q=${encodeURIComponent(query)}&type=${tab.key}`}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              activeType === tab.key
                ? 'bg-navy text-white'
                : 'border border-border hover:bg-muted',
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Results */}
      {filteredResults.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            No results found for &quot;{query}&quot;. Try different keywords.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredResults.map((result, idx) => {
            const config = typeConfig[result.type];
            const Icon = config?.icon ?? FileText;
            const typeLabel = config?.label ?? result.type;
            const formattedDate = new Date(result.date).toLocaleDateString(
              'en-US',
              { month: 'short', day: 'numeric', year: 'numeric' },
            );

            return (
              <Link
                key={`${result.type}-${idx}`}
                href={result.url}
                className="block rounded-lg border border-border p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-gold" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-navy/10 px-2 py-0.5 text-xs font-medium text-navy">
                        {typeLabel}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formattedDate}
                      </span>
                    </div>
                    <h3 className="mt-1 font-medium">{result.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {result.excerpt}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
