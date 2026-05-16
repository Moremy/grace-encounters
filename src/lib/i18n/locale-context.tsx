'use client';

import * as React from 'react';
import { defaultLocale, type Locale } from './config';
import type { Dictionary } from './get-dictionary';

interface LocaleContextValue {
  locale: Locale;
  dictionary: Dictionary;
  t: (key: string) => string;
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

/**
 * Resolves a dotted key path (e.g. "nav.dashboard") from a nested dictionary.
 * Returns the key itself as fallback if resolution fails.
 */
function resolveKey(dictionary: Dictionary, key: string): string {
  const parts = key.split('.');
  if (parts.length === 2) {
    const [namespace, field] = parts;
    const section = dictionary[namespace];
    if (section && field in section) {
      return section[field];
    }
  }
  return key;
}

interface LocaleProviderProps {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}

/**
 * Provides the current locale and translation function to the component tree.
 */
export function LocaleProvider({ locale, dictionary, children }: LocaleProviderProps) {
  const t = React.useCallback(
    (key: string) => resolveKey(dictionary, key),
    [dictionary],
  );

  const value = React.useMemo(
    () => ({ locale, dictionary, t }),
    [locale, dictionary, t],
  );

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

/**
 * Access the locale context. Returns null-safe defaults if used outside provider.
 */
export function useLocaleContext(): LocaleContextValue {
  const context = React.useContext(LocaleContext);
  if (!context) {
    return {
      locale: defaultLocale,
      dictionary: {},
      t: (key: string) => key,
    };
  }
  return context;
}
