/**
 * Bypass de autenticação (sem Firebase) para desenvolvimento local e demos em deploy.
 *
 * - **Local (`pnpm dev`)**: ativo por padrão; use `VITE_DEV_SKIP_AUTH=false` para testar Firebase.
 * - **Produção / Vercel**: use `VITE_DEMO_SKIP_AUTH=true` só para demonstração; qualquer pessoa
 *   com a URL acessa como admin. Desligue e use Firebase em ambiente real.
 */
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
  return isDevAuthBypassEnabled() || isDemoAuthBypassEnabled();
}
