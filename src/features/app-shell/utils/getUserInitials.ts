import type { AppUserProfile } from '@/types/domain';

export function getUserInitials(profile: AppUserProfile): string {
  const first = profile.firstName?.trim().charAt(0);
  const last = profile.lastName?.trim().charAt(0);
  if (first && last) {
    return `${first}${last}`.toUpperCase();
  }

  const parts = profile.displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0]!.length >= 2) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0]!.charAt(0).toUpperCase();
  }

  const local = profile.email.split('@')[0]?.trim();
  if (local && local.length >= 2) {
    return local.slice(0, 2).toUpperCase();
  }
  return (local?.charAt(0) ?? '?').toUpperCase();
}
