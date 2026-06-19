import * as React from 'react';
import type { Metadata } from 'next';
import { Search } from 'lucide-react';

import { SearchResults } from '@/components/search/search-results';
import { globalSearch } from '@/lib/search/actions';

export const metadata: Metadata = {
  title: 'Search | Light Bearers',
  description: 'Search testimonies, devotionals, events, media, and more.',
};

interface SearchPageProps {
  searchParams: { q?: string; type?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q ?? '';
  const type = searchParams.type ?? 'all';

  const results = query ? await globalSearch(query, type) : [];

  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="bg-ivory py-12">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="font-serif text-4xl tracking-tight text-navy">
            Search
          </h1>
          <p className="mt-2 text-muted-foreground">
            Find testimonies, devotionals, events, media, and more.
          </p>
          <form action="/search" method="get" className="mt-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search for sermons, testimonies, worship..."
                className="w-full rounded-lg border border-input bg-background py-3 pl-12 pr-4 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input type="hidden" name="type" value={type} />
            </div>
          </form>
        </div>
      </section>

      {/* Results section */}
      <section className="mx-auto max-w-4xl px-6 py-8">
        {query ? (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
            </p>
            <SearchResults results={results} activeType={type} query={query} />
          </>
        ) : (
          <div className="py-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Try searching for: sermons, testimonies, worship, devotionals, events...
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
