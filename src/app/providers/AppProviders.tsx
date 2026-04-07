import { AuthProvider } from '@/context/AuthContext';
import { CompanyProvider } from '@/context/CompanyContext';
import { RepositoryProvider } from '@/context/RepositoryContext';
import type { ReactNode } from 'react';

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <RepositoryProvider>
      <AuthProvider>
        <CompanyProvider>{children}</CompanyProvider>
      </AuthProvider>
    </RepositoryProvider>
  );
}
