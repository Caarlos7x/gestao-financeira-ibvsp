import { RequireSelectedCompany } from '@/components/shared/RequireSelectedCompany';
import { PageHeader } from '@/components/ui/PageHeader';
import { useRepository } from '@/context/RepositoryContext';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { useEffect, useState } from 'react';
import type { Asset } from '@/types/domain';
import { formatAssetStatusPt } from '@/utils/domainLabelsPtBR';
import { formatCurrency } from '@/utils/formatCurrency';

export function AssetsPage() {
  const repository = useRepository();

  return (
    <section className="page">
      <PageHeader
        title="Ativos"
        description="Cadastro com ciclo de vida (status), titularidade e valor patrimonial."
      />
      <RequireSelectedCompany>
        {(companyId) => (
          <AssetsBody repository={repository} companyId={companyId} />
        )}
      </RequireSelectedCompany>
    </section>
  );
}

type AssetsBodyProps = {
  repository: ReturnType<typeof useRepository>;
  companyId: string;
};

function AssetsBody({ repository, companyId }: AssetsBodyProps) {
  const [rows, setRows] = useState<Asset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    repository
      .listAssets(companyId)
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
    <table className="data-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Categoria</th>
          <th>Status</th>
          <th>Valor</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.name}</td>
            <td>{row.category}</td>
            <td>{formatAssetStatusPt(row.status)}</td>
            <td>{formatCurrency(row.acquisitionValue, row.currencyCode, 'pt-BR')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
