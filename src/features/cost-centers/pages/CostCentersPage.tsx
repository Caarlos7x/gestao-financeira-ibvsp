import { RequireSelectedCompany } from '@/components/shared/RequireSelectedCompany';
import { PageHeader } from '@/components/ui/PageHeader';
import { useRepository } from '@/context/RepositoryContext';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import type { FinancialPlatformRepository } from '@/services/repositories/financialPlatformRepository';
import { useEffect, useState } from 'react';
import type { CompanyId, CostCenter } from '@/types/domain';

export function CostCentersPage() {
  const repository = useRepository();

  return (
    <section className="page">
      <PageHeader
        title="Centros de custo"
        description="Estrutura operacional e alocação de despesas por empresa."
      />
      <RequireSelectedCompany>
        {(companyId) => (
          <CostCentersTable repository={repository} companyId={companyId} />
        )}
      </RequireSelectedCompany>
    </section>
  );
}

type CostCentersTableProps = {
  repository: FinancialPlatformRepository;
  companyId: CompanyId;
};

function CostCentersTable({ repository, companyId }: CostCentersTableProps) {
  const [rows, setRows] = useState<CostCenter[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    repository
      .listCostCenters(companyId)
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
          <th>Responsável (ID)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.name}</td>
            <td className="mono">{row.ownerUserId ?? '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
