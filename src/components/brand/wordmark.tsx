import * as React from 'react';
import { cn } from '@/lib/utils';

type WordmarkVariant = 'default' | 'inverted' | 'mono';
type WordmarkSize = 'sm' | 'md' | 'lg';

interface WordmarkProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: WordmarkVariant;
  size?: WordmarkSize;
}

const sizeMap: Record<WordmarkSize, { text: string; glyph: number }> = {
  sm: { text: 'text-base', glyph: 16 },
  md: { text: 'text-xl', glyph: 18 },
  lg: { text: 'text-3xl', glyph: 22 },
};

export function Wordmark({ className, variant = 'default', size = 'md', ...props }: WordmarkProps) {
  const { text: textSize, glyph } = sizeMap[size];
  const wrapper = cn(
    'inline-flex items-center gap-2 font-serif tracking-tight',
    textSize,
    variant === 'inverted' && 'text-ivory',
    variant === 'mono' && 'text-current',
    variant === 'default' && 'text-navy',
    className,
  );
  // Olive-leaf glyph: a single curved blade with subtle gold fill and navy stroke
  // (mono variant uses currentColor)
  const fill = variant === 'mono' ? 'currentColor' : '#C9A96E';
  const stroke = variant === 'mono' ? 'currentColor' : variant === 'inverted' ? '#FAF7F2' : '#0E2A47';
  return (
    <span className={wrapper} aria-label="Light and Salt" {...props}>
      <svg
        width={glyph}
        height={glyph}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Olive leaf: an asymmetric curved blade with a small stem */}
        <path d="M4 18 C 8 6, 18 4, 21 8 C 18 16, 10 20, 4 18 Z" fill={fill} fillOpacity={0.18} />
        <path d="M4 18 C 8 6, 18 4, 21 8" />
        <path d="M21 8 C 18 16, 10 20, 4 18" />
        <path d="M4 18 L 9 12" />
      </svg>
      <span>Light and Salt</span>
    </span>
  );
}
