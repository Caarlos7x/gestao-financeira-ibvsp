import { RequireSelectedCompany } from '@/components/shared/RequireSelectedCompany';
import { PageHeader } from '@/components/ui/PageHeader';
import { useRepository } from '@/context/RepositoryContext';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { useEffect, useState } from 'react';
import type { PayableAccount } from '@/types/domain';
import { formatPayableStatusPt } from '@/utils/domainLabelsPtBR';
import { formatCurrency } from '@/utils/formatCurrency';

export function AccountsPayablePage() {
  const repository = useRepository();

  return (
    <section className="page">
      <PageHeader
        title="Contas a pagar"
        description="Ciclo de status definido no domínio (transições validadas por papel do usuário)."
      />
      <RequireSelectedCompany>
        {(companyId) => (
          <PayablesBody repository={repository} companyId={companyId} />
        )}
      </RequireSelectedCompany>
    </section>
  );
}

type PayablesBodyProps = {
  repository: ReturnType<typeof useRepository>;
  companyId: string;
};

function PayablesBody({ repository, companyId }: PayablesBodyProps) {
  const [rows, setRows] = useState<PayableAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    repository
      .listPayables(companyId)
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
          <th>Fornecedor (ID)</th>
          <th>Valor</th>
          <th>Vencimento</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td className="mono">{row.supplierId}</td>
            <td>{formatCurrency(row.amount, row.currencyCode, 'pt-BR')}</td>
            <td>{row.dueDate}</td>
            <td>{formatPayableStatusPt(row.status)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
