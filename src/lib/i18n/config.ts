/**
 * Internationalization configuration.
 * Lightweight i18n system using cookie-based locale detection.
 */

export const defaultLocale = 'en';

export const supportedLocales = ['en', 'es', 'fr', 'pt', 'sw', 'ko'] as const;

export type Locale = (typeof supportedLocales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Espanol',
  fr: 'Francais',
  pt: 'Portugues',
  sw: 'Kiswahili',
  ko: '한국어',
};

/** Right-to-left locales (none currently, but ready for future expansion) */
export const rtlLocales: Locale[] = [];

/** Cookie name used to persist the user's preferred locale */
export const LOCALE_COOKIE = 'NEXT_LOCALE';

export function isValidLocale(locale: string): locale is Locale {
  return supportedLocales.includes(locale as Locale);
}
