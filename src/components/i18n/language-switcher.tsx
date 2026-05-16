'use client';

import * as React from 'react';
import { Globe } from 'lucide-react';
import { LOCALE_COOKIE, localeNames, supportedLocales, type Locale } from '@/lib/i18n/config';
import { useLocaleContext } from '@/lib/i18n/locale-context';

/**
 * Language switcher dropdown that sets the locale cookie and reloads the page.
 */
export function LanguageSwitcher() {
  const { locale } = useLocaleContext();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLocale = e.target.value as Locale;
    // Set the locale cookie
    document.cookie = `${LOCALE_COOKIE}=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    // Reload the page to apply the new locale
    window.location.reload();
  }

  return (
    <div className="flex items-center gap-1.5">
      <Globe className="h-4 w-4 text-foreground/60" aria-hidden="true" />
      <select
        value={locale}
        onChange={handleChange}
        aria-label="Select language"
        className="bg-transparent text-sm text-foreground/80 border-none outline-none cursor-pointer hover:text-primary focus:ring-1 focus:ring-primary rounded px-1 py-0.5"
      >
        {supportedLocales.map((loc) => (
          <option key={loc} value={loc}>
            {localeNames[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}
