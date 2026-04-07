import type { UserRole } from '@/types/domain';

export type Permission =
  | 'platform:admin'
  | 'companies:read'
  | 'companies:write'
  | 'cost_centers:write'
  | 'budgets:read'
  | 'budgets:write'
  | 'payables:read'
  | 'payables:write'
  | 'payables:approve'
  | 'reports:read'
  | 'audit:read'
  | 'settings:write';

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  admin: [
    'platform:admin',
    'companies:read',
    'companies:write',
    'cost_centers:write',
    'budgets:read',
    'budgets:write',
    'payables:read',
    'payables:write',
    'payables:approve',
    'reports:read',
    'audit:read',
    'settings:write',
  ],
  finance_manager: [
    'companies:read',
    'cost_centers:write',
    'budgets:read',
    'budgets:write',
    'payables:read',
    'payables:write',
    'payables:approve',
    'reports:read',
    'audit:read',
    'settings:write',
  ],
  analyst: [
    'companies:read',
    'budgets:read',
    'payables:read',
    'reports:read',
  ],
  approver: [
    'companies:read',
    'payables:read',
    'payables:approve',
    'reports:read',
  ],
  viewer: ['companies:read', 'budgets:read', 'payables:read', 'reports:read'],
};

export function permissionsForRole(role: UserRole): Set<Permission> {
  return new Set(ROLE_PERMISSIONS[role]);
}

export function hasPermission(
  role: UserRole,
  permission: Permission
): boolean {
  return permissionsForRole(role).has(permission);
}
