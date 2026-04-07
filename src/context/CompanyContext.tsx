import type { Company, CompanyId } from '@/types/domain';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useRepository } from '@/context/RepositoryContext';

type CompanyContextValue = {
  allowedCompanies: Company[];
  selectedCompanyId: CompanyId | null;
  setSelectedCompanyId: (companyId: CompanyId) => void;
};

const CompanyContext = createContext<CompanyContextValue | null>(null);

type CompanyProviderProps = {
  children: ReactNode;
};

export function CompanyProvider({ children }: CompanyProviderProps) {
  const { state } = useAuthContext();
  const repository = useRepository();
  const [allowedCompanies, setAllowedCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyIdState] =
    useState<CompanyId | null>(null);

  useEffect(() => {
    if (state.status !== 'signed_in') {
      setAllowedCompanies([]);
      setSelectedCompanyIdState(null);
      return;
    }

    let cancelled = false;

    (async () => {
      const allCompanies = await repository.listCompanies();
      const allowed = allCompanies.filter((company) =>
        state.profile.companyIds.includes(company.id)
      );

      if (cancelled) {
        return;
      }

      setAllowedCompanies(allowed);
      setSelectedCompanyIdState((previous) => {
        if (previous && allowed.some((c) => c.id === previous)) {
          return previous;
        }
        return allowed[0]?.id ?? null;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [repository, state]);

  const setSelectedCompanyId = useCallback((companyId: CompanyId) => {
    setSelectedCompanyIdState(companyId);
  }, []);

  const value = useMemo(
    () => ({
      allowedCompanies,
      selectedCompanyId,
      setSelectedCompanyId,
    }),
    [allowedCompanies, selectedCompanyId, setSelectedCompanyId]
  );

  return (
    <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>
  );
}

export function useCompanyContext(): CompanyContextValue {
  const ctx = useContext(CompanyContext);
  if (!ctx) {
    throw new Error('useCompanyContext must be used within CompanyProvider.');
  }
  return ctx;
}
