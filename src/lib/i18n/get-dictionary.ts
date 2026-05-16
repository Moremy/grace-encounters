import type { Locale } from './config';
import { defaultLocale, isValidLocale } from './config';

export type Dictionary = Record<string, Record<string, string>>;

/**
 * Dynamically imports the JSON dictionary for the given locale.
 * Uses dynamic import for code-splitting per locale bundle.
 * Falls back to English if the locale is invalid or loading fails.
 */
export async function getDictionary(locale: string): Promise<Dictionary> {
  const resolvedLocale: Locale = isValidLocale(locale) ? locale : defaultLocale;

  try {
    const dictionary = await import(`./dictionaries/${resolvedLocale}.json`);
    return dictionary.default ?? dictionary;
  } catch {
    // Fallback to English if locale file is missing
    const fallback = await import('./dictionaries/en.json');
    return fallback.default ?? fallback;
  }
}
