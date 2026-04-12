/**
 * Login e-mail/senha **sem Firebase**, apenas em `pnpm dev`.
 *
 * Ative com `VITE_ENABLE_LOCAL_TEST_LOGIN=true` no `.env` e **`VITE_DEV_SKIP_AUTH=false`**
 * para ver a tela de login e entrar com uma das contas abaixo.
 *
 * Os perfis (papéis, empresas) vêm do mock (`getUserProfileForEmail`).
 * Não use em produção: este arquivo não roda fora de `import.meta.env.DEV`.
 */

const LOCAL_TEST_ACCOUNTS: ReadonlyArray<{
  email: string;
  password: string;
}> = [
  {
    email: 'admin@sistema.test',
    password: 'ibvsp-test-local',
  },
  {
    email: 'operador@sistema.test',
    password: 'ibvsp-test-local',
  },
];

export function isLocalTestLoginEnabled(): boolean {
  return (
    import.meta.env.DEV === true &&
    import.meta.env.VITE_ENABLE_LOCAL_TEST_LOGIN === 'true'
  );
}

/**
 * @returns e-mail normalizado se usuário e senha baterem; senão `null`.
 */
export function matchLocalTestCredentials(
  email: string,
  password: string
): string | null {
  const key = email.trim().toLowerCase();
  const ok = LOCAL_TEST_ACCOUNTS.some(
    (a) => a.email === key && a.password === password
  );
  return ok ? key : null;
}
