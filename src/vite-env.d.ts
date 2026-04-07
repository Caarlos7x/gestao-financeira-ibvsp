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
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
