import { computeBudgetBalance } from '@/domain/budgetBalance';
import { useAuthContext } from '@/context/AuthContext';
import { useCompanyContext } from '@/context/CompanyContext';
import { useRepository } from '@/context/RepositoryContext';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Text } from '@/components/ui/Text';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { DashboardMovementsCharts } from '@/features/dashboard/components/DashboardMovementsCharts';
import {
  buildDirectionTotals,
  buildExpenseByCostCenter,
  buildMonthlyMovementRows,
} from '@/features/dashboard/domain/aggregateMovements';
import { useEffect, useMemo, useState } from 'react';
import type {
  Budget,
  ChurchOperationalExpense,
  CostCenter,
  FinancialTransaction,
  PayableAccount,
} from '@/types/domain';
import { formatPayableStatusPt } from '@/utils/domainLabelsPtBR';
import { formatCurrency } from '@/utils/formatCurrency';

export function DashboardPage() {
  const { state } = useAuthContext();
  const { selectedCompanyId } = useCompanyContext();
  const repository = useRepository();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [payables, setPayables] = useState<PayableAccount[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [churchExpenses, setChurchExpenses] = useState<
    ChurchOperationalExpense[]
  >([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCompanyId) {
      setBudgets([]);
      setPayables([]);
      setTransactions([]);
      setChurchExpenses([]);
      setCostCenters([]);
      setLoadError(null);
      return;
    }

    let cancelled = false;
    setLoadError(null);

    Promise.all([
      repository.listBudgets(selectedCompanyId),
      repository.listPayables(selectedCompanyId),
      repository.listTransactions(selectedCompanyId),
      repository.listChurchExpenses(selectedCompanyId),
      repository.listCostCenters(selectedCompanyId),
    ])
      .then(([budgetRows, payableRows, txRows, churchRows, ccRows]) => {
        if (!cancelled) {
          setBudgets(budgetRows);
          setPayables(payableRows);
          setTransactions(txRows);
          setChurchExpenses(churchRows);
          setCostCenters(ccRows);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setLoadError(
            cause instanceof Error
              ? cause.message
              : UI_MESSAGES_PT_BR.dashboardLoadFailed
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [repository, selectedCompanyId]);

  const monthlyRows = useMemo(
    () => buildMonthlyMovementRows(transactions, churchExpenses),
    [transactions, churchExpenses]
  );

  const directionTotals = useMemo(
    () => buildDirectionTotals(transactions, churchExpenses),
    [transactions, churchExpenses]
  );

  const costCenterExpenseRows = useMemo(
    () => buildExpenseByCostCenter(transactions, costCenters),
    [transactions, costCenters]
  );

  const chartCurrency =
    transactions[0]?.currencyCode ??
    churchExpenses[0]?.currencyCode ??
    budgets[0]?.currencyCode ??
    'BRL';

  const profile = state.status === 'signed_in' ? state.profile : null;
  const openPayables = payables.filter(
    (row) => row.status !== 'paid' && row.status !== 'cancelled'
  );

  return (
    <section className="page dashboard">
      <PageHeader
        title="Painel"
        description="Visão operacional da empresa selecionada: indicadores, contas a pagar e gráficos das movimentações financeiras e despesas da igreja."
      />
      {profile ? (
        <Text variant="muted" className="dashboard-greeting">
          Conectado como{' '}
          <Text variant="mono" as="span">
            {profile.email}
          </Text>
        </Text>
      ) : null}
      {!selectedCompanyId ? (
        <p className="state-message">{UI_MESSAGES_PT_BR.noCompanySelected}</p>
      ) : null}
      {loadError ? <p className="state-message">{loadError}</p> : null}
      {selectedCompanyId && !loadError ? (
        <>
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
                      {balance.isOverBudget
                        ? 'Acima do planejado'
                        : 'Dentro do planejado'}{' '}
                      · saldo{' '}
                      {formatCurrency(
                        balance.remaining,
                        budget.currencyCode,
                        'pt-BR'
                      )}
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
            <Card variant="metric" title="Movimentações carregadas">
              <p className="metric">{transactions.length}</p>
              <ul className="metric-list">
                <li>
                  Lançamentos financeiros: {transactions.length} · Despesas
                  igreja: {churchExpenses.length}
                </li>
              </ul>
            </Card>
          </div>

          <DashboardMovementsCharts
            monthlyRows={monthlyRows}
            directionTotals={directionTotals}
            costCenterRows={costCenterExpenseRows}
            currencyCode={chartCurrency}
          />
        </>
      ) : null}
    </section>
  );
}
