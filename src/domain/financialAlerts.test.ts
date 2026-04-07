import {
  analyzePayablesForAlerts,
  evaluateLiquidityFarol,
  totalBudgetLiquidityProxy,
} from '@/domain/financialAlerts';
import {
  DEFAULT_FINANCIAL_ALERT_PREFERENCES,
  type FinancialAlertPreferences,
} from '@/types/domain';
import type { Budget, PayableAccount } from '@/types/domain';
import { describe, expect, it } from 'vitest';

const prefs: FinancialAlertPreferences = {
  ...DEFAULT_FINANCIAL_ALERT_PREFERENCES,
  enableLiquidityAlerts: true,
  minimumLiquidityThresholdBrl: 1_000,
  enablePayableDueAlerts: true,
  payableDueSoonDays: 7,
  enablePendingPayableAlerts: true,
  includeScheduledInPendingReview: true,
};

describe('evaluateLiquidityFarol', () => {
  it('vermelho quando saldo proxy negativo', () => {
    expect(
      evaluateLiquidityFarol(-1, {
        enableLiquidityAlerts: true,
        minimumLiquidityThresholdBrl: 1_000,
      })
    ).toBe('red');
  });

  it('amarelo quando abaixo do mínimo mas não negativo', () => {
    expect(
      evaluateLiquidityFarol(500, {
        enableLiquidityAlerts: true,
        minimumLiquidityThresholdBrl: 1_000,
      })
    ).toBe('yellow');
  });

  it('verde quando acima do mínimo', () => {
    expect(
      evaluateLiquidityFarol(5_000, {
        enableLiquidityAlerts: true,
        minimumLiquidityThresholdBrl: 1_000,
      })
    ).toBe('green');
  });
});

describe('totalBudgetLiquidityProxy', () => {
  it('soma saldos restantes', () => {
    const budgets: Budget[] = [
      {
        id: '1',
        companyId: 'c',
        costCenterId: 'cc',
        periodId: 'p',
        plannedAmount: 100,
        actualAmount: 40,
        currencyCode: 'BRL',
        version: 1,
      },
      {
        id: '2',
        companyId: 'c',
        costCenterId: 'cc2',
        periodId: 'p',
        plannedAmount: 50,
        actualAmount: 50,
        currencyCode: 'BRL',
        version: 1,
      },
    ];
    expect(totalBudgetLiquidityProxy(budgets)).toBe(60);
  });
});

describe('analyzePayablesForAlerts', () => {
  const today = '2025-04-10';

  it('vermelho em vencimento quando há atraso', () => {
    const rows: PayableAccount[] = [
      {
        id: '1',
        companyId: 'c',
        supplierId: 's',
        amount: 100,
        currencyCode: 'BRL',
        dueDate: '2025-04-01',
        status: 'approved',
      },
    ];
    const r = analyzePayablesForAlerts(rows, today, prefs);
    expect(r.dueLight).toBe('red');
    expect(r.detail.overdueCount).toBe(1);
  });

  it('amarelo quando vence em breve', () => {
    const rows: PayableAccount[] = [
      {
        id: '1',
        companyId: 'c',
        supplierId: 's',
        amount: 100,
        currencyCode: 'BRL',
        dueDate: '2025-04-12',
        status: 'approved',
      },
    ];
    const r = analyzePayablesForAlerts(rows, today, prefs);
    expect(r.dueLight).toBe('yellow');
    expect(r.detail.dueSoonCount).toBe(1);
  });

  it('amarelo em pendências com rascunho', () => {
    const rows: PayableAccount[] = [
      {
        id: '1',
        companyId: 'c',
        supplierId: 's',
        amount: 100,
        currencyCode: 'BRL',
        dueDate: '2025-12-31',
        status: 'pending_approval',
      },
    ];
    const r = analyzePayablesForAlerts(rows, today, prefs);
    expect(r.pendingLight).toBe('yellow');
    expect(r.detail.pendingWorkflowCount).toBe(1);
  });
});
