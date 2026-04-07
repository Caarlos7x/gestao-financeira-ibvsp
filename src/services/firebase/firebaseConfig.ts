export type FirebaseWebConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export function isFirebaseWebConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID &&
      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET &&
      import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID &&
      import.meta.env.VITE_FIREBASE_APP_ID
  );
}

export function readFirebaseWebConfig(): FirebaseWebConfig {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;

  if (
    !apiKey ||
    !authDomain ||
    !projectId ||
    !storageBucket ||
    !messagingSenderId ||
    !appId
  ) {
    const missing: string[] = [];
    if (!apiKey) missing.push('VITE_FIREBASE_API_KEY');
    if (!authDomain) missing.push('VITE_FIREBASE_AUTH_DOMAIN');
    if (!projectId) missing.push('VITE_FIREBASE_PROJECT_ID');
    if (!storageBucket) missing.push('VITE_FIREBASE_STORAGE_BUCKET');
    if (!messagingSenderId) missing.push('VITE_FIREBASE_MESSAGING_SENDER_ID');
    if (!appId) missing.push('VITE_FIREBASE_APP_ID');
    throw new Error(
      `Variáveis Firebase ausentes: ${missing.join(', ')}. Copie .env.example para .env e preencha.`
    );
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}
