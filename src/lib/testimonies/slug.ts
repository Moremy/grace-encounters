/**
 * Slugify a testimony title. Lowercases, replaces non-alphanumerics with
 * single hyphens, trims hyphens at edges, caps length at 80 characters.
 * Slug uniqueness is the moderator's responsibility on approval; collision
 * handling lives in the moderation server action, not here.
 */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}
