import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createMockFinancialPlatformRepository } from '@/services/repositories/mock/createMockFinancialPlatformRepository';
import type { FinancialPlatformRepository } from '@/services/repositories/financialPlatformRepository';

const RepositoryContext = createContext<FinancialPlatformRepository | null>(
  null
);

type RepositoryProviderProps = {
  children: ReactNode;
};

export function RepositoryProvider({ children }: RepositoryProviderProps) {
  const repository = useMemo(
    () => createMockFinancialPlatformRepository(),
    []
  );

  return (
    <RepositoryContext.Provider value={repository}>
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepository(): FinancialPlatformRepository {
  const value = useContext(RepositoryContext);
  if (!value) {
    throw new Error('useRepository must be used within RepositoryProvider.');
  }
  return value;
}
