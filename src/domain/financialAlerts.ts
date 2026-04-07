import { computeBudgetBalance } from '@/domain/budgetBalance';
import type {
  Budget,
  FinancialAlertPreferences,
  PayableAccount,
  TrafficLightLevel,
} from '@/types/domain';

export type PayablesAlertDetail = {
  overdueCount: number;
  dueSoonCount: number;
  pendingWorkflowCount: number;
  scheduledAwaitingPaymentCount: number;
};

function addDaysYmd(ymd: string, days: number): string {
  const d = new Date(`${ymd}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function dueYmd(payable: PayableAccount): string {
  return payable.dueDate.length >= 10
    ? payable.dueDate.slice(0, 10)
    : payable.dueDate;
}

export function isPayableOpen(payable: PayableAccount): boolean {
  return payable.status !== 'paid' && payable.status !== 'cancelled';
}

/** Soma dos saldos restantes (planejado − realizado) por orçamento — proxy de liquidez. */
export function totalBudgetLiquidityProxy(budgets: Budget[]): number {
  return budgets.reduce((sum, budget) => {
    const { remaining } = computeBudgetBalance(
      budget.plannedAmount,
      budget.actualAmount
    );
    return sum + remaining;
  }, 0);
}

export function evaluateLiquidityFarol(
  totalLiquidityProxy: number,
  prefs: Pick<
    FinancialAlertPreferences,
    'enableLiquidityAlerts' | 'minimumLiquidityThresholdBrl'
  >
): TrafficLightLevel {
  if (!prefs.enableLiquidityAlerts) {
    return 'green';
  }
  if (totalLiquidityProxy < 0) {
    return 'red';
  }
  if (totalLiquidityProxy < prefs.minimumLiquidityThresholdBrl) {
    return 'yellow';
  }
  return 'green';
}

export function analyzePayablesForAlerts(
  payables: PayableAccount[],
  todayYmd: string,
  prefs: FinancialAlertPreferences
): {
  dueLight: TrafficLightLevel;
  pendingLight: TrafficLightLevel;
  detail: PayablesAlertDetail;
} {
  const open = payables.filter(isPayableOpen);

  let overdueCount = 0;
  let dueSoonCount = 0;
  const horizonEnd = addDaysYmd(todayYmd, Math.max(0, prefs.payableDueSoonDays));

  for (const p of open) {
    const due = dueYmd(p);
    if (due < todayYmd) {
      overdueCount += 1;
    } else if (due <= horizonEnd) {
      dueSoonCount += 1;
    }
  }

  const pendingWorkflowCount = open.filter(
    (p) => p.status === 'draft' || p.status === 'pending_approval'
  ).length;

  const scheduledAwaitingPaymentCount = open.filter(
    (p) => p.status === 'scheduled'
  ).length;

  let dueLight: TrafficLightLevel = 'green';
  if (prefs.enablePayableDueAlerts) {
    if (overdueCount > 0) {
      dueLight = 'red';
    } else if (dueSoonCount > 0) {
      dueLight = 'yellow';
    }
  }

  const pendingTotal =
    pendingWorkflowCount +
    (prefs.includeScheduledInPendingReview ? scheduledAwaitingPaymentCount : 0);

  let pendingLight: TrafficLightLevel = 'green';
  if (prefs.enablePendingPayableAlerts && pendingTotal > 0) {
    pendingLight = 'yellow';
  }

  return {
    dueLight,
    pendingLight,
    detail: {
      overdueCount,
      dueSoonCount,
      pendingWorkflowCount,
      scheduledAwaitingPaymentCount,
    },
  };
}
