/**
 * Em `vite` (import.meta.env.DEV), o login é ignorado por padrão para agilizar o desenvolvimento.
 * Defina VITE_DEV_SKIP_AUTH=false no .env para testar Firebase Auth localmente.
 */
export function isDevAuthBypassEnabled(): boolean {
  if (!import.meta.env.DEV) {
    return false;
  }
  return import.meta.env.VITE_DEV_SKIP_AUTH !== 'false';
}
