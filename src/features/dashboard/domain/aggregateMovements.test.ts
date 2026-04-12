import {
  buildDirectionTotals,
  buildMonthlyMovementRows,
  monthKeyFromDateString,
} from '@/features/dashboard/domain/aggregateMovements';
import { describe, expect, it } from 'vitest';
import type {
  ChurchOperationalExpense,
  FinancialTransaction,
} from '@/types/domain';

describe('monthKeyFromDateString', () => {
  it('extrai YYYY-MM de ISO', () => {
    expect(monthKeyFromDateString('2025-03-12T10:00:00.000Z')).toBe('2025-03');
  });

  it('extrai YYYY-MM de data curta', () => {
    expect(monthKeyFromDateString('2025-04-20')).toBe('2025-04');
  });
});

describe('buildMonthlyMovementRows', () => {
  const tx: FinancialTransaction[] = [
    {
      id: '1',
      companyId: 'c1',
      costCenterId: null,
      categoryId: null,
      amount: 100,
      currencyCode: 'BRL',
      direction: 'income',
      occurredAt: '2025-03-01T12:00:00.000Z',
      description: 'A',
    },
    {
      id: '2',
      companyId: 'c1',
      costCenterId: null,
      categoryId: null,
      amount: 40,
      currencyCode: 'BRL',
      direction: 'expense',
      occurredAt: '2025-03-15T12:00:00.000Z',
      description: 'B',
    },
  ];

  const church: ChurchOperationalExpense[] = [
    {
      id: 'c1',
      companyId: 'c1',
      categoryId: null,
      amount: 10,
      currencyCode: 'BRL',
      expenseType: 'maintenance',
      occurredAt: '2025-03-20',
      description: 'C',
    },
  ];

  it('agrega receita, despesa em movimentos e despesa igreja por mês', () => {
    const rows = buildMonthlyMovementRows(tx, church);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.income).toBe(100);
    expect(rows[0]?.expenseTransactions).toBe(40);
    expect(rows[0]?.churchExpense).toBe(10);
  });
});

describe('buildDirectionTotals', () => {
  it('soma receitas e todas as despesas', () => {
    const tx: FinancialTransaction[] = [
      {
        id: '1',
        companyId: 'c1',
        costCenterId: null,
        categoryId: null,
        amount: 200,
        currencyCode: 'BRL',
        direction: 'income',
        occurredAt: '2025-01-01',
        description: '',
      },
      {
        id: '2',
        companyId: 'c1',
        costCenterId: null,
        categoryId: null,
        amount: 50,
        currencyCode: 'BRL',
        direction: 'expense',
        occurredAt: '2025-01-02',
        description: '',
      },
    ];
    const church: ChurchOperationalExpense[] = [
      {
        id: 'e',
        companyId: 'c1',
        categoryId: null,
        amount: 25,
        currencyCode: 'BRL',
        expenseType: 'other',
        occurredAt: '2025-01-03',
        description: '',
      },
    ];
    expect(buildDirectionTotals(tx, church)).toEqual({
      income: 200,
      expense: 75,
    });
  });
});
