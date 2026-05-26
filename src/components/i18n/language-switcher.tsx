'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';

import { LOCALE_COOKIE, localeNames, supportedLocales, type Locale } from '@/lib/i18n/config';
import { useLocaleContext } from '@/lib/i18n/locale-context';

export function LanguageSwitcher() {
  const router = useRouter();
  const { locale } = useLocaleContext();
  const [selectedLocale, setSelectedLocale] = React.useState<Locale>(locale);

  React.useEffect(() => {
    setSelectedLocale(locale);
  }, [locale]);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLocale = e.target.value as Locale;

    setSelectedLocale(newLocale);

    document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;

    router.refresh();
  }

  return (
    <div className="flex items-center gap-1.5">
      <Globe className="h-4 w-4 text-foreground/60" aria-hidden="true" />

      <select
        value={selectedLocale}
        onChange={handleChange}
        aria-label="Select language"
        className="cursor-pointer rounded border-none bg-transparent px-1 py-0.5 text-sm text-foreground/80 outline-none hover:text-primary focus:ring-1 focus:ring-primary"
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
