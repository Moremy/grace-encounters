'use client';

import { formatDate } from '@/lib/i18n/formatting';
import { useLocaleContext } from '@/lib/i18n/locale-context';

interface FormattedDateProps {
  date: Date | string | number;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
}

/**
 * Renders a date formatted according to the current locale.
 */
export function FormattedDate({ date, options, className }: FormattedDateProps) {
  const { locale } = useLocaleContext();
  return <time className={className}>{formatDate(date, locale, options)}</time>;
}
