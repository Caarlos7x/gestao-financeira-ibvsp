import { computeBudgetBalance } from '@/domain/budgetBalance';
import { useAuthContext } from '@/context/AuthContext';
import { useCompanyContext } from '@/context/CompanyContext';
import { useRepository } from '@/context/RepositoryContext';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Text } from '@/components/ui/Text';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { useEffect, useState } from 'react';
import type { Budget, PayableAccount } from '@/types/domain';
import { formatPayableStatusPt } from '@/utils/domainLabelsPtBR';
import { formatCurrency } from '@/utils/formatCurrency';

export function DashboardPage() {
  const { state } = useAuthContext();
  const { selectedCompanyId } = useCompanyContext();
  const repository = useRepository();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [payables, setPayables] = useState<PayableAccount[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCompanyId) {
      setBudgets([]);
      setPayables([]);
      setLoadError(null);
      return;
    }

    let cancelled = false;
    setLoadError(null);

    Promise.all([
      repository.listBudgets(selectedCompanyId),
      repository.listPayables(selectedCompanyId),
    ])
      .then(([budgetRows, payableRows]) => {
        if (!cancelled) {
          setBudgets(budgetRows);
          setPayables(payableRows);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setLoadError(
            cause instanceof Error ? cause.message : UI_MESSAGES_PT_BR.dashboardLoadFailed
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [repository, selectedCompanyId]);

  const profile = state.status === 'signed_in' ? state.profile : null;
  const openPayables = payables.filter(
    (row) => row.status !== 'paid' && row.status !== 'cancelled'
  );

  return (
    <section className="page dashboard">
      <PageHeader
        title="Painel"
        description="Visão operacional da empresa selecionada. Os dados vêm de portas de repositório, prontos para migrar de mocks para planilhas (via Apps Script) ou banco de dados."
      />
      {profile ? (
        <Text variant="muted" className="dashboard-greeting">
          Conectado como <Text variant="mono" as="span">{profile.email}</Text>
        </Text>
      ) : null}
      {!selectedCompanyId ? (
        <p className="state-message">{UI_MESSAGES_PT_BR.noCompanySelected}</p>
      ) : null}
      {loadError ? <p className="state-message">{loadError}</p> : null}
      {selectedCompanyId && !loadError ? (
        <div className="grid-cards">
          <Card variant="metric" title="Orçamentos acompanhados">
            <p className="metric">{budgets.length}</p>
            <ul className="metric-list">
              {budgets.map((budget) => {
                const balance = computeBudgetBalance(
                  budget.plannedAmount,
                  budget.actualAmount
                );
                return (
                  <li key={budget.id}>
                    {budget.costCenterId}:{' '}
                    {balance.isOverBudget ? 'Acima do planejado' : 'Dentro do planejado'} · saldo{' '}
                    {formatCurrency(balance.remaining, budget.currencyCode, 'pt-BR')}
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card variant="metric" title="Contas a pagar em aberto">
            <p className="metric">{openPayables.length}</p>
            <ul className="metric-list">
              {openPayables.map((row) => (
                <li key={row.id}>
                  {formatPayableStatusPt(row.status)} ·{' '}
                  {formatCurrency(row.amount, row.currencyCode, 'pt-BR')}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      ) : null}
    </section>
  );
}
