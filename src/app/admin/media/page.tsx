import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getPublishedMedia, deleteMediaItem } from '@/lib/media/actions';
import { getMediaTypeLabel, formatDuration } from '@/lib/media/utils';

export const metadata: Metadata = {
  title: 'Manage Media Library - Admin',
};

export default async function AdminMediaPage() {
  const media = await getPublishedMedia();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-navy">Manage Media Library</h1>
        <Button variant="sacred" size="sm" asChild>
          <Link href="/admin/media/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Media
          </Link>
        </Button>
      </div>

      {media.length === 0 ? (
        <div className="rounded-lg border border-border bg-card py-16 text-center">
          <p className="text-muted-foreground">No media items yet.</p>
          <Button variant="outline" size="sm" className="mt-4" asChild>
            <Link href="/admin/media/new">Add your first media item</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-ivory/50">
              <tr>
                <th className="px-4 py-3 font-medium text-navy">Title</th>
                <th className="px-4 py-3 font-medium text-navy">Type</th>
                <th className="px-4 py-3 font-medium text-navy">Category</th>
                <th className="px-4 py-3 font-medium text-navy">Duration</th>
                <th className="px-4 py-3 font-medium text-navy">Featured</th>
                <th className="px-4 py-3 font-medium text-navy">Date</th>
                <th className="px-4 py-3 font-medium text-navy">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {media.map((item) => (
                <tr key={item.id} className="hover:bg-ivory/30">
                  <td className="px-4 py-3 font-medium text-navy max-w-[200px] truncate">
                    {item.title}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {getMediaTypeLabel(item.mediaType)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">
                    {item.category.toLowerCase()}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.duration ? formatDuration(item.duration) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        item.featured
                          ? 'bg-gold/15 text-gold'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.featured ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.publishedAt
                      ? new Date(item.publishedAt).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <form action={deleteMediaItem.bind(null, item.id)}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
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
