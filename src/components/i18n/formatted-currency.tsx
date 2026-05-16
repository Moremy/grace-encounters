'use client';

import { formatCurrency } from '@/lib/i18n/formatting';
import { useLocaleContext } from '@/lib/i18n/locale-context';

interface FormattedCurrencyProps {
  amount: number;
  currency?: string;
  className?: string;
}

/**
 * Renders a currency amount formatted according to the current locale.
 */
export function FormattedCurrency({ amount, currency = 'USD', className }: FormattedCurrencyProps) {
  const { locale } = useLocaleContext();
  return <span className={className}>{formatCurrency(amount, currency, locale)}</span>;
}
