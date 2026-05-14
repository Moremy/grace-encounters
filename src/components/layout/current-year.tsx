'use client';

import * as React from 'react';

/**
 * Renders the current year, computed in the browser so a statically rendered
 * page does not lag into the new year between deploys.
 *
 * Falls back to a sensible build-time year on the server pass to keep the
 * rendered string non-empty (and the visual layout stable) before hydration.
 */
export function CurrentYear() {
  const [year, setYear] = React.useState<number>(() => new Date().getFullYear());

  React.useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <span suppressHydrationWarning>{year}</span>;
}
