import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getPublishedSermons, getSermonSeries } from '@/lib/sermon/actions';
import { formatDuration } from '@/lib/media/utils';

export const metadata: Metadata = {
  title: 'Manage Sermons - Admin',
};

export default async function AdminSermonsPage() {
  const [sermons, series] = await Promise.all([
    getPublishedSermons(),
    getSermonSeries(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-navy">Manage Sermons</h1>
        <Button variant="sacred" size="sm" asChild>
          <Link href="/admin/sermons/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Sermon
          </Link>
        </Button>
      </div>

      {/* Series Section */}
      {series.length > 0 && (
        <div className="mb-8">
          <h2 className="font-serif text-lg text-navy mb-3">Series</h2>
          <div className="flex flex-wrap gap-2">
            {series.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1 rounded-full bg-ivory px-3 py-1 text-sm text-navy"
              >
                {s.title}
                <span className="ml-1 text-xs text-muted-foreground">
                  ({s._count?.sermons ?? 0})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sermons Table */}
      {sermons.length === 0 ? (
        <div className="rounded-lg border border-border bg-card py-16 text-center">
          <p className="text-muted-foreground">No sermons yet.</p>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link href="/admin/sermons/new">Add your first sermon</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-ivory/50">
              <tr>
                <th className="px-4 py-3 font-medium text-navy">Title</th>
                <th className="px-4 py-3 font-medium text-navy">Speaker</th>
                <th className="px-4 py-3 font-medium text-navy">Series</th>
                <th className="px-4 py-3 font-medium text-navy">Duration</th>
                <th className="px-4 py-3 font-medium text-navy">Featured</th>
                <th className="px-4 py-3 font-medium text-navy">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sermons.map((sermon) => (
                <tr key={sermon.id} className="hover:bg-ivory/30">
                  <td className="px-4 py-3 font-medium text-navy max-w-[200px] truncate">
                    {sermon.title}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {sermon.speaker?.displayName ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {sermon.series?.title ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {sermon.duration ? formatDuration(sermon.duration) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        sermon.featured
                          ? 'bg-gold/15 text-gold'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {sermon.featured ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {sermon.publishedAt
                      ? new Date(sermon.publishedAt).toLocaleDateString()
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
