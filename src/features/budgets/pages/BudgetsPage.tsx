import { RequireSelectedCompany } from '@/components/shared/RequireSelectedCompany';
import { PageHeader } from '@/components/ui/PageHeader';
import { computeBudgetBalance } from '@/domain/budgetBalance';
import { useRepository } from '@/context/RepositoryContext';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { useEffect, useState } from 'react';
import type { Budget } from '@/types/domain';
import { formatCurrency } from '@/utils/formatCurrency';

export function BudgetsPage() {
  const repository = useRepository();

  return (
    <section className="page">
      <PageHeader
        title="Orçamentos"
        description="Planejado versus realizado, com sinais de utilização (regras no domínio, não na interface)."
      />
      <RequireSelectedCompany>
        {(companyId) => (
          <BudgetsBody repository={repository} companyId={companyId} />
        )}
      </RequireSelectedCompany>
    </section>
  );
}

type BudgetsBodyProps = {
  repository: ReturnType<typeof useRepository>;
  companyId: string;
};

function BudgetsBody({ repository, companyId }: BudgetsBodyProps) {
  const [rows, setRows] = useState<Budget[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    repository
      .listBudgets(companyId)
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
          <th>Centro de custo</th>
          <th>Planejado</th>
          <th>Realizado</th>
          <th>Saldo</th>
          <th>Situação</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const balance = computeBudgetBalance(row.plannedAmount, row.actualAmount);
          return (
            <tr key={row.id}>
              <td className="mono">{row.costCenterId}</td>
              <td>{formatCurrency(row.plannedAmount, row.currencyCode, 'pt-BR')}</td>
              <td>{formatCurrency(row.actualAmount, row.currencyCode, 'pt-BR')}</td>
              <td>{formatCurrency(balance.remaining, row.currencyCode, 'pt-BR')}</td>
              <td>{balance.isOverBudget ? 'Acima do orçamento' : 'Dentro do orçamento'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
