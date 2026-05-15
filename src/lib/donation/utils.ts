/**
 * Converts a title into a URL-safe slug with a unique suffix.
 */
export function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const suffix = Math.random().toString(36).substring(2, 8);

  return `${base}-${suffix}`;
}
