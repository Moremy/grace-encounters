import Link from 'next/link';
import { cn } from '@/lib/utils';

type CategoryFilterProps = {
  categories: { label: string; value: string }[];
  activeCategory: string | undefined;
};

export function CategoryFilter({
  categories,
  activeCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/blog"
        className={cn(
          'rounded-full px-3 py-1.5 text-sm transition-colors',
          !activeCategory
            ? 'bg-gold text-navy font-medium'
            : 'bg-muted text-muted-foreground hover:bg-gold/10',
        )}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.value}
          href={`/blog?category=${cat.value}`}
          className={cn(
            'rounded-full px-3 py-1.5 text-sm transition-colors',
            activeCategory === cat.value
              ? 'bg-gold text-navy font-medium'
              : 'bg-muted text-muted-foreground hover:bg-gold/10',
          )}
        >
          {cat.label}
        </Link>
      ))}
    </div>
  );
}
