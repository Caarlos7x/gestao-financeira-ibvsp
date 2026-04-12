import { RequireSelectedCompany } from '@/components/shared/RequireSelectedCompany';
import { PageHeader } from '@/components/ui/PageHeader';
import { useRepository } from '@/context/RepositoryContext';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { useEffect, useState } from 'react';
import type { Investment } from '@/types/domain';
import { formatInvestmentInstrumentPt } from '@/utils/domainLabelsPtBR';
import { formatCurrency } from '@/utils/formatCurrency';

export function InvestmentsPage() {
  const repository = useRepository();

  return (
    <section className="page">
      <PageHeader
        title="Investimentos"
        description="Registro de instrumentos e principal aplicado (rentabilidade histórica pode ser uma camada futura)."
      />
      <RequireSelectedCompany>
        {(companyId) => (
          <InvestmentsBody repository={repository} companyId={companyId} />
        )}
      </RequireSelectedCompany>
    </section>
  );
}

type InvestmentsBodyProps = {
  repository: ReturnType<typeof useRepository>;
  companyId: string;
};

function InvestmentsBody({ repository, companyId }: InvestmentsBodyProps) {
  const [rows, setRows] = useState<Investment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    repository
      .listInvestments(companyId)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : UI_MESSAGES_PT_BR.loadFailed);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [repository, companyId]);

  if (loading) return <p className="state-message">{UI_MESSAGES_PT_BR.loading}</p>;
  if (error) return <p className="state-message">{error}</p>;

  return (
    <div className="table-responsive">
    <table className="data-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Tipo</th>
          <th>Início</th>
          <th>Principal</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.name}</td>
            <td>{formatInvestmentInstrumentPt(row.instrumentType)}</td>
            <td>{row.openedAt}</td>
            <td>{formatCurrency(row.principalAmount, row.currencyCode, 'pt-BR')}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
