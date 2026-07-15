import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

export type WordmarkSize = 'sm' | 'md' | 'lg';

interface WordmarkProps {
  size?: WordmarkSize;
  className?: string;
}

const SIZE_MAP: Record<WordmarkSize, string> = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-14',
};

export function Wordmark({ size = 'md', className }: WordmarkProps = {}) {
  return (
    <Link href="/" className={cn('inline-flex items-center', className)}>
      <Image
        src="/images/logo.svg"
        alt="The Light Bearers Ministry"
        width={180}
        height={68}
        priority
        className={cn('w-auto rounded-md bg-cream px-2 py-1', SIZE_MAP[size])}
      />
    </Link>
  );
}
