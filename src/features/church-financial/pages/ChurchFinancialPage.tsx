import { RequireSelectedCompany } from '@/components/shared/RequireSelectedCompany';
import { PageHeader } from '@/components/ui/PageHeader';
import { useRepository } from '@/context/RepositoryContext';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { useEffect, useState } from 'react';
import type { ChurchOperationalExpense } from '@/types/domain';
import { formatChurchExpenseTypePt } from '@/utils/domainLabelsPtBR';
import { formatCurrency } from '@/utils/formatCurrency';

export function ChurchFinancialPage() {
  const repository = useRepository();

  return (
    <section className="page">
      <PageHeader
        title="Gestão da igreja — despesas gerais"
        description="Despesas operacionais da igreja por tipo (manutenção, eventos, operações)."
      />
      <RequireSelectedCompany>
        {(companyId) => (
          <ChurchExpensesBody repository={repository} companyId={companyId} />
        )}
      </RequireSelectedCompany>
    </section>
  );
}

type ChurchExpensesBodyProps = {
  repository: ReturnType<typeof useRepository>;
  companyId: string;
};

function ChurchExpensesBody({ repository, companyId }: ChurchExpensesBodyProps) {
  const [rows, setRows] = useState<ChurchOperationalExpense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    repository
      .listChurchExpenses(companyId)
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
          <th>Data</th>
          <th>Tipo</th>
          <th>Descrição</th>
          <th>Valor</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.occurredAt}</td>
            <td>{formatChurchExpenseTypePt(row.expenseType)}</td>
            <td>{row.description}</td>
            <td>{formatCurrency(row.amount, row.currencyCode, 'pt-BR')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
