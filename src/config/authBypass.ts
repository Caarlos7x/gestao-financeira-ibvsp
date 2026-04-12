/**
 * Bypass de autenticação (sem Firebase) para desenvolvimento local e demos em deploy.
 *
 * **`TEMPORARY_DIRECT_ACCESS`**: quando `true`, não existe tela de login — entrada direta
 * como administrador (perfil `admin@sistema.test` do mock). Altere para `false` e restaure
 * a rota `/login` no router quando for reativar Firebase/login.
 */
export const TEMPORARY_DIRECT_ACCESS = true;

export function isTemporaryDirectAccess(): boolean {
  return TEMPORARY_DIRECT_ACCESS;
}

export function isDevAuthBypassEnabled(): boolean {
  if (!import.meta.env.DEV) {
    return false;
  }
  return import.meta.env.VITE_DEV_SKIP_AUTH !== 'false';
}

export function isDemoAuthBypassEnabled(): boolean {
  return import.meta.env.VITE_DEMO_SKIP_AUTH === 'true';
}

export function isAuthBypassEnabled(): boolean {
  return (
    TEMPORARY_DIRECT_ACCESS ||
    isDevAuthBypassEnabled() ||
    isDemoAuthBypassEnabled()
  );
}
