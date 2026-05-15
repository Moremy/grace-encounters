'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'HEALING', label: 'Healing' },
  { value: 'SALVATION', label: 'Salvation' },
  { value: 'DELIVERANCE', label: 'Deliverance' },
  { value: 'PROVISION', label: 'Provision' },
  { value: 'RESTORATION', label: 'Restoration' },
  { value: 'FAITH', label: 'Faith' },
];

const MEDIA_TYPES = [
  { value: '', label: 'All' },
  { value: 'TEXT', label: 'Text' },
  { value: 'AUDIO', label: 'Audio' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'PDF', label: 'PDF' },
];

export function TestimonyFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentCategory = searchParams.get('category') ?? '';
  const currentMediaType = searchParams.get('mediaType') ?? '';

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname],
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          Category
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => updateParam('category', cat.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                currentCategory === cat.value
                  ? 'bg-navy text-ivory'
                  : 'bg-navy/5 text-navy hover:bg-navy/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          Media Type
        </p>
        <div className="flex flex-wrap gap-2">
          {MEDIA_TYPES.map((mt) => (
            <button
              key={mt.value}
              type="button"
              onClick={() => updateParam('mediaType', mt.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                currentMediaType === mt.value
                  ? 'bg-navy text-ivory'
                  : 'bg-navy/5 text-navy hover:bg-navy/10'
              }`}
            >
              {mt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
