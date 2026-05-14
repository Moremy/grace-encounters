/**
 * Role precedence is rank-based (admin > moderator > user).
 *
 * Multi-admin support is data-driven: any number of profiles can have
 * role=ADMIN. No code change required to add more admins later.
 *
 * Two flavors of check are exposed:
 *
 * - `hasRole`, `canModerate`, `canAdmin` are *permission* gates. They use
 *   rank comparison, so an admin satisfies a moderator gate. Use these in
 *   feature flags and authorization checks.
 * - `isExactly` is an *identity* check. It returns true only when the role
 *   matches the target exactly. Use it when you need to filter or label by
 *   role (e.g. listing the moderators distinctly from admins in a UI).
 *
 * `isAdmin` and `isModerator` are kept for backwards compatibility and read
 * as rank-based permission gates. New call sites should prefer the explicit
 * `canAdmin` / `canModerate` / `isExactly` names.
 */

export type Role = 'user' | 'moderator' | 'admin';

export const ROLES: readonly Role[] = ['user', 'moderator', 'admin'] as const;

const ROLE_RANK: Record<Role, number> = { user: 0, moderator: 1, admin: 2 };

export function hasRole(actual: Role | null | undefined, required: Role): boolean {
  return actual ? ROLE_RANK[actual] >= ROLE_RANK[required] : false;
}

/** Permission gate: true for moderators and admins. */
export function canModerate(role: Role | null | undefined): boolean {
  return hasRole(role, 'moderator');
}

/** Permission gate: true for admins only. */
export function canAdmin(role: Role | null | undefined): boolean {
  return hasRole(role, 'admin');
}

/** Identity check: true only when the role matches the target exactly. */
export function isExactly(
  actual: Role | null | undefined,
  target: Role,
): boolean {
  return actual === target;
}

/**
 * Permission gate alias for `canAdmin`. Reads as a rank-based check, not an
 * identity check: `isAdmin('admin')` is true and so is any future role with
 * a higher rank. Prefer `canAdmin` at new call sites.
 */
export function isAdmin(role: Role | null | undefined): boolean {
  return canAdmin(role);
}

/**
 * Permission gate alias for `canModerate`. `isModerator('admin')` is true
 * because admins outrank moderators. Use `isExactly(role, 'moderator')` when
 * you need a strict identity check. Prefer `canModerate` at new call sites.
 */
export function isModerator(role: Role | null | undefined): boolean {
  return canModerate(role);
}

export function fromPrismaRole(
  role: 'USER' | 'MODERATOR' | 'ADMIN' | null | undefined,
): Role | null {
  if (!role) return null;
  switch (role) {
    case 'USER':
      return 'user';
    case 'MODERATOR':
      return 'moderator';
    case 'ADMIN':
      return 'admin';
    default:
      return null;
  }
}
