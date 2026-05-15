/**
 * Converts a title into a URL-safe slug with a random suffix for uniqueness.
 */
export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const suffix = Math.random().toString(36).substring(2, 8);

  return `${base}-${suffix}`;
}
