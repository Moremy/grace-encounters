import type { Metadata } from 'next';
import { Search } from 'lucide-react';

import { Reveal } from '@/components/brand/reveal';
import { MediaCard } from '@/components/media/media-card';
import { PlaylistCard } from '@/components/media/playlist-card';
import { getPublishedMedia, getFeaturedMedia, getMediaPlaylists } from '@/lib/media/actions';

export const metadata: Metadata = {
  title: 'Media Library',
  description:
    'Watch, listen, and connect with Light Bearers through sermons, worship, teaching, and more.',
};

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Sermons', value: 'SERMON' },
  { label: 'Worship', value: 'WORSHIP' },
  { label: 'Teaching', value: 'TEACHING' },
  { label: 'Testimony', value: 'TESTIMONY' },
  { label: 'Conference', value: 'CONFERENCE' },
];

export default async function MediaPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const category =
    typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const search =
    typeof searchParams.search === 'string' ? searchParams.search : undefined;

  const [media, featured, playlists] = await Promise.all([
    getPublishedMedia({ category, search }),
    getFeaturedMedia(),
    getMediaPlaylists(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="bg-ivory py-24">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Media
          </p>
          <h1 className="mt-4 font-serif text-3xl md:text-4xl text-navy">
            Watch &amp; Listen
          </h1>
          <p className="mt-4 mx-auto max-w-2xl text-muted-foreground">
            Sermons, testimonies, worship, and conversations. Wherever you are, the Word
            goes with you.
          </p>
        </div>
      </section>

      {/* Featured Media */}
      {featured.length > 0 && (
        <section className="bg-background py-16">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <h2 className="font-serif text-2xl text-navy mb-6">Featured</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((item) => (
                  <MediaCard key={item.id} media={item} />
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Category Tabs & Search */}
      <section className="bg-background py-16 border-t">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            {/* Search */}
            <form className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  name="search"
                  placeholder="Search media..."
                  defaultValue={search ?? ''}
                  className="w-full rounded-md border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
                {category && (
                  <input type="hidden" name="category" value={category} />
                )}
              </div>
            </form>

            {/* Category Tabs */}
            <div className="mb-8 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isActive = (category ?? '') === cat.value;
                const href = cat.value
                  ? `/media?category=${cat.value}${search ? `&search=${search}` : ''}`
                  : `/media${search ? `?search=${search}` : ''}`;
                return (
                  <a
                    key={cat.value}
                    href={href}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gold text-navy'
                        : 'bg-ivory text-navy hover:bg-gold/10'
                    }`}
                  >
                    {cat.label}
                  </a>
                );
              })}
            </div>

            {/* Media Grid */}
            {media.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">
                  No media found. Check back soon for new content.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {media.map((item) => (
                  <MediaCard key={item.id} media={item} />
                ))}
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* Playlists */}
      {playlists.length > 0 && (
        <section className="bg-ivory py-16">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <h2 className="font-serif text-2xl text-navy mb-6">Playlists</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {playlists.map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
