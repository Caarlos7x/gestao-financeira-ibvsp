import type { AppUserProfile } from '@/types/domain';

/**
 * Nome + sobrenome para o topbar. Usa firstName/lastName quando existirem;
 * caso contrário deriva de displayName ou e-mail.
 */
export function formatHeaderPersonName(profile: AppUserProfile): string {
  const first = profile.firstName?.trim();
  const last = profile.lastName?.trim();
  if (first && last) {
    return `${first} ${last}`;
  }
  if (first) {
    return first;
  }
  if (last) {
    return last;
  }

  const parts = profile.displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]} ${parts.slice(1).join(' ')}`;
  }
  if (parts.length === 1) {
    return parts[0]!;
  }

  const local = profile.email.split('@')[0]?.trim();
  return local || profile.email;
}
