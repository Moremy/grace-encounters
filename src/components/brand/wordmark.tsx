import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

export type WordmarkSize = 'sm' | 'md' | 'lg';
export type WordmarkVariant = 'default' | 'inverted';

interface WordmarkProps {
  size?: WordmarkSize;
  variant?: WordmarkVariant;
  className?: string;
}

const SIZE_MAP: Record<WordmarkSize, { image: number; text: string }> = {
  sm: { image: 32, text: 'text-base' },
  md: { image: 42, text: 'text-xl' },
  lg: { image: 56, text: 'text-2xl' },
};

export function Wordmark({
  size = 'md',
  variant = 'default',
  className,
}: WordmarkProps = {}) {
  const { image, text } = SIZE_MAP[size];
  return (
    <Link
      href="/"
      className={cn('flex items-center gap-3', className)}
    >
      <Image
        src="/logo.png"
        alt="Light Bearers"
        width={image}
        height={image}
        className="rounded-md object-contain"
        priority
      />
      <span
        className={cn(
          'font-semibold tracking-tight',
          text,
          variant === 'inverted' && 'text-ivory',
        )}
      >
        Light Bearers
      </span>
    </Link>
  );
}
