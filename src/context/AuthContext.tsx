import type { User as FirebaseUser } from 'firebase/auth';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  isAuthBypassEnabled,
  isDemoAuthBypassEnabled,
  isDevAuthBypassEnabled,
} from '@/config/authBypass';
import {
  isLocalTestLoginEnabled,
  matchLocalTestCredentials,
} from '@/config/localTestAuth';
import { getFirebaseAuth } from '@/services/firebase/firebaseAuth';
import { isFirebaseWebConfigured } from '@/services/firebase/firebaseConfig';
import { useRepository } from '@/context/RepositoryContext';
import type { AppUserProfile } from '@/types/domain';

export type AuthState =
  | { status: 'loading' }
  | { status: 'config_error'; message: string }
  | { status: 'signed_out' }
  | {
      status: 'signed_in';
      firebaseUser: FirebaseUser | null;
      profile: AppUserProfile;
    };

type AuthContextValue = {
  state: AuthState;
  signInWithEmailPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function enrichProfileNames(profile: AppUserProfile): AppUserProfile {
  const hasExplicit =
    (profile.firstName?.trim() ?? '') !== '' ||
    (profile.lastName?.trim() ?? '') !== '';
  if (hasExplicit) {
    return {
      ...profile,
      firstName: profile.firstName?.trim() || undefined,
      lastName: profile.lastName?.trim() || undefined,
    };
  }

  const parts = profile.displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return {
      ...profile,
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
    };
  }
  if (parts.length === 1) {
    return { ...profile, firstName: parts[0], lastName: undefined };
  }

  const local = profile.email.split('@')[0]?.trim();
  return {
    ...profile,
    firstName: local || undefined,
    lastName: undefined,
  };
}

function buildSessionProfile(
  firebaseUser: FirebaseUser,
  mockProfile: AppUserProfile | null
): AppUserProfile {
  if (mockProfile) {
    return enrichProfileNames({
      ...mockProfile,
      userId: firebaseUser.uid,
      email: firebaseUser.email ?? mockProfile.email,
      displayName:
        firebaseUser.displayName?.trim() || mockProfile.displayName,
    });
  }

  return enrichProfileNames({
    userId: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    displayName:
      firebaseUser.displayName?.trim() ||
      firebaseUser.email ||
      'Usuário autenticado',
    role: 'viewer',
    companyIds: [],
  });
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const repository = useRepository();
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    if (isAuthBypassEnabled()) {
      let cancelled = false;

      (async () => {
        const companies = await repository.listCompanies();
        if (cancelled) {
          return;
        }

        if (isDemoAuthBypassEnabled()) {
          const adminSeed = await repository.getUserProfileForEmail(
            'admin@sistema.test'
          );
          const companyIds =
            adminSeed?.companyIds?.length && adminSeed.companyIds.length > 0
              ? adminSeed.companyIds
              : companies.map((c) => c.id);

          const profileBase =
            adminSeed ??
            ({
              userId: 'demo-bypass',
              email: 'admin@sistema.test',
              displayName: 'Administrador',
              firstName: 'Admin',
              lastName: undefined,
              role: 'admin' as const,
              companyIds,
            } satisfies AppUserProfile);

          setState({
            status: 'signed_in',
            firebaseUser: null,
            profile: enrichProfileNames({
              ...profileBase,
              userId: 'demo-bypass',
              companyIds,
            }),
          });
          return;
        }

        setState({
          status: 'signed_in',
          firebaseUser: null,
          profile: enrichProfileNames({
            userId: 'dev-bypass',
            email: 'dev@local',
            displayName: 'Desenvolvimento Local',
            firstName: 'Desenvolvimento',
            lastName: 'Local',
            role: 'admin',
            companyIds: companies.map((c) => c.id),
          }),
        });
      })();

      return () => {
        cancelled = true;
      };
    }

    if (isLocalTestLoginEnabled()) {
      setState({ status: 'signed_out' });
      return;
    }

    if (!isFirebaseWebConfigured()) {
      setState({
        status: 'config_error',
        message:
          'Firebase não está configurado. Adicione as variáveis VITE_FIREBASE_* no arquivo .env.',
      });
      return;
    }

    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setState({ status: 'signed_out' });
        return;
      }

      const email = firebaseUser.email?.trim().toLowerCase() ?? '';
      const mockProfile = email
        ? await repository.getUserProfileForEmail(email)
        : null;

      setState({
        status: 'signed_in',
        firebaseUser,
        profile: buildSessionProfile(firebaseUser, mockProfile),
      });
    });

    return () => unsubscribe();
  }, [repository]);

  const signInWithEmailPassword = useCallback(
    async (email: string, password: string) => {
      if (isAuthBypassEnabled()) {
        return;
      }

      const localEmail =
        isLocalTestLoginEnabled() &&
        matchLocalTestCredentials(email, password);
      if (localEmail) {
        const mockProfile =
          await repository.getUserProfileForEmail(localEmail);
        if (!mockProfile) {
          throw new Error(
            'Perfil não encontrado no mock para este e-mail. Verifique o seed.'
          );
        }
        setState({
          status: 'signed_in',
          firebaseUser: null,
          profile: enrichProfileNames({
            ...mockProfile,
            userId: 'local-test-login',
          }),
        });
        return;
      }

      if (!isFirebaseWebConfigured()) {
        throw new Error('Firebase não está configurado.');
      }
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email.trim(), password);
    },
    [repository]
  );

  const signOut = useCallback(async () => {
    if (isDemoAuthBypassEnabled()) {
      return;
    }
    if (isDevAuthBypassEnabled()) {
      setState({ status: 'signed_out' });
      return;
    }
    if (!isFirebaseWebConfigured()) {
      return;
    }
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo(
    () => ({ state, signInWithEmailPassword, signOut }),
    [state, signInWithEmailPassword, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider.');
  }
  return ctx;
}
