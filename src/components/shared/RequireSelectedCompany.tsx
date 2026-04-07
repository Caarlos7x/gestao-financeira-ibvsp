import type { CompanyId } from '@/types/domain';
import { useCompanyContext } from '@/context/CompanyContext';
import type { ReactNode } from 'react';

type RequireSelectedCompanyProps = {
  children: (companyId: CompanyId) => ReactNode;
};

export function RequireSelectedCompany({
  children,
}: RequireSelectedCompanyProps) {
  const { selectedCompanyId } = useCompanyContext();

  if (!selectedCompanyId) {
    return (
      <p className="state-message">
        Nenhuma empresa selecionada ou disponível. Solicite acesso a um administrador.
      </p>
    );
  }

  return children(selectedCompanyId);
}
