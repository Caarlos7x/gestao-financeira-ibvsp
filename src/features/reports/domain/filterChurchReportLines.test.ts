import {
  churchReportDateOnly,
  filterChurchReportLines,
  summarizeChurchReportLines,
} from '@/features/reports/domain/filterChurchReportLines';
import type { ChurchReportLine } from '@/types/domain';
import { describe, expect, it } from 'vitest';

const sample: ChurchReportLine[] = [
  {
    id: 'a',
    source: 'financial_transaction',
    occurredAt: '2025-02-01T10:00:00.000Z',
    description: 'Dízimos',
    amount: 100,
    direction: 'income',
    currencyCode: 'BRL',
    referenceKey: null,
  },
  {
    id: 'b',
    source: 'financial_transaction',
    occurredAt: '2025-03-15',
    description: 'Energia',
    amount: 50,
    direction: 'expense',
    currencyCode: 'BRL',
    referenceKey: 'cc-1',
  },
];

describe('churchReportDateOnly', () => {
  it('extrai yyyy-mm-dd de ISO', () => {
    expect(churchReportDateOnly('2025-02-01T10:00:00.000Z')).toBe('2025-02-01');
  });
});

describe('filterChurchReportLines', () => {
  it('filtra por intervalo de datas', () => {
    const out = filterChurchReportLines(sample, {
      dateFrom: '2025-03-01',
      dateTo: '2025-03-31',
      direction: 'all',
      search: '',
    });
    expect(out).toHaveLength(1);
    expect(out[0]!.id).toBe('b');
  });

  it('filtra por texto na descrição', () => {
    const out = filterChurchReportLines(sample, {
      dateFrom: '',
      dateTo: '',
      direction: 'all',
      search: 'díz',
    });
    expect(out).toHaveLength(1);
    expect(out[0]!.id).toBe('a');
  });
});

describe('summarizeChurchReportLines', () => {
  it('soma receitas e despesas', () => {
    const s = summarizeChurchReportLines(sample);
    expect(s.totalIncome).toBe(100);
    expect(s.totalExpense).toBe(50);
    expect(s.currencyCode).toBe('BRL');
  });
});
