import { Bookmark, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { removeBookmark } from '@/lib/bible-study/actions';

interface ScriptureBookmarkProps {
  bookmark: {
    id: string;
    reference: string;
    content: string | null;
    note: string | null;
    createdAt: Date;
  };
}

export function ScriptureBookmarkCard({ bookmark }: ScriptureBookmarkProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Bookmark className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
            <div className="space-y-1">
              <p className="font-medium text-navy">{bookmark.reference}</p>
              {bookmark.content && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {bookmark.content}
                </p>
              )}
              {bookmark.note && (
                <p className="text-sm italic text-muted-foreground">
                  {bookmark.note}
                </p>
              )}
            </div>
          </div>
          <form action={removeBookmark.bind(null, bookmark.id)}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
