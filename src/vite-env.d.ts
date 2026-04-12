/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  /** URL publicada do Google Apps Script (POST JSON) para anexar linhas na planilha */
  readonly VITE_GOOGLE_APPS_SCRIPT_URL?: string;
  /** Em dev: use "false" para exigir login Firebase; omita ou qualquer outro valor para pular login */
  readonly VITE_DEV_SKIP_AUTH?: string;
  /**
   * Em build de produção (ex.: Vercel): `true` pula Firebase e entra como perfil do seed `admin@sistema.test`.
   * Apenas para demo; não use com dados reais.
   */
  readonly VITE_DEMO_SKIP_AUTH?: string;
  /**
   * Só em dev: permite login na tela com usuários definidos em `src/config/localTestAuth.ts` (sem Firebase).
   * Use junto de `VITE_DEV_SKIP_AUTH=false`.
   */
  readonly VITE_ENABLE_LOCAL_TEST_LOGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
