/**
 * Converts a name into a URL-safe slug with a unique suffix.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .concat('-', Math.random().toString(36).slice(2, 8));
}
