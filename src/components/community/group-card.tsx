import Link from 'next/link';
import { Users } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const categoryLabels: Record<string, string> = {
  PRAYER: 'Prayer',
  BIBLE_STUDY: 'Bible Study',
  WORSHIP: 'Worship',
  FELLOWSHIP: 'Fellowship',
  OUTREACH: 'Outreach',
  YOUTH: 'Youth',
  WOMEN: 'Women',
  MEN: 'Men',
};

interface GroupCardProps {
  group: {
    slug: string;
    name: string;
    description: string;
    category: string;
    memberCount: number;
  };
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Link href={`/community/${group.slug}`} className="block">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <span className="inline-block self-start rounded-full bg-gold/15 text-gold px-3 py-1 text-xs font-medium">
            {categoryLabels[group.category] ?? group.category}
          </span>
          <CardTitle className="mt-3 font-serif text-xl text-navy">
            {group.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {group.description}
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{group.memberCount} members</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
