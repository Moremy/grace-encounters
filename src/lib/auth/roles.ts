/**
 * Role precedence is rank-based (admin > moderator > user).
 *
 * Multi-admin support is data-driven: any number of profiles can have
 * role=ADMIN. No code change required to add more admins later.
 */

export type Role = 'user' | 'moderator' | 'admin';

export const ROLES: readonly Role[] = ['user', 'moderator', 'admin'] as const;

const ROLE_RANK: Record<Role, number> = { user: 0, moderator: 1, admin: 2 };

export function hasRole(actual: Role | null | undefined, required: Role): boolean {
  return actual ? ROLE_RANK[actual] >= ROLE_RANK[required] : false;
}

export function isAdmin(role: Role | null | undefined): boolean {
  return hasRole(role, 'admin');
}

export function isModerator(role: Role | null | undefined): boolean {
  return hasRole(role, 'moderator');
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
