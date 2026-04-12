import type {
  ChurchOperationalExpense,
  CostCenter,
  FinancialTransaction,
} from '@/types/domain';

/** Chave `YYYY-MM` extraída de ISO ou `YYYY-MM-DD`. */
export function monthKeyFromDateString(isoOrDate: string): string {
  const head = isoOrDate.trim().slice(0, 10);
  if (head.length < 7) {
    return head;
  }
  return head.slice(0, 7);
}

export function formatMonthLabelPt(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number);
  if (!y || !m) {
    return monthKey;
  }
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

export type MonthlyMovementRow = {
  monthKey: string;
  label: string;
  income: number;
  expenseTransactions: number;
  churchExpense: number;
};

export function buildMonthlyMovementRows(
  transactions: FinancialTransaction[],
  churchExpenses: ChurchOperationalExpense[]
): MonthlyMovementRow[] {
  const map = new Map<
    string,
    { income: number; expenseTx: number; church: number }
  >();

  const cell = (key: string) => {
    let c = map.get(key);
    if (!c) {
      c = { income: 0, expenseTx: 0, church: 0 };
      map.set(key, c);
    }
    return c;
  };

  for (const t of transactions) {
    const key = monthKeyFromDateString(t.occurredAt);
    const v = cell(key);
    if (t.direction === 'income') {
      v.income += t.amount;
    } else {
      v.expenseTx += t.amount;
    }
  }

  for (const e of churchExpenses) {
    const key = monthKeyFromDateString(e.occurredAt);
    cell(key).church += e.amount;
  }

  const keys = [...map.keys()].sort();
  return keys.map((monthKey) => {
    const v = map.get(monthKey)!;
    return {
      monthKey,
      label: formatMonthLabelPt(monthKey),
      income: v.income,
      expenseTransactions: v.expenseTx,
      churchExpense: v.church,
    };
  });
}

export type DirectionTotals = { income: number; expense: number };

export function buildDirectionTotals(
  transactions: FinancialTransaction[],
  churchExpenses: ChurchOperationalExpense[]
): DirectionTotals {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.direction === 'income') {
      income += t.amount;
    } else {
      expense += t.amount;
    }
  }
  for (const e of churchExpenses) {
    expense += e.amount;
  }
  return { income, expense };
}

export type CostCenterExpenseRow = { name: string; amount: number };

export function buildExpenseByCostCenter(
  transactions: FinancialTransaction[],
  costCenters: CostCenter[]
): CostCenterExpenseRow[] {
  const byId = new Map(costCenters.map((c) => [c.id, c.name]));
  const agg = new Map<string, number>();

  for (const t of transactions) {
    if (t.direction !== 'expense') {
      continue;
    }
    const label = t.costCenterId
      ? (byId.get(t.costCenterId) ?? t.costCenterId)
      : 'Sem centro de custo';
    agg.set(label, (agg.get(label) ?? 0) + t.amount);
  }

  return [...agg.entries()]
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);
}
