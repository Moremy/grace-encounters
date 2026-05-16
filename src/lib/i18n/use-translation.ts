'use client';

import { useLocaleContext } from './locale-context';
import type { Locale } from './config';

interface UseTranslationReturn {
  t: (key: string) => string;
  locale: Locale;
}

/**
 * Client hook that provides the t() translation function.
 * Reads from the LocaleProvider context.
 * Falls back to the key string if the translation is not found.
 */
export function useTranslation(): UseTranslationReturn {
  const { t, locale } = useLocaleContext();
  return { t, locale };
}
