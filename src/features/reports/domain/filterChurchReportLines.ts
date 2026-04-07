import type { ChurchReportLine } from '@/types/domain';

export type ChurchReportUiFilters = {
  dateFrom: string;
  dateTo: string;
  direction: 'all' | 'income' | 'expense';
  search: string;
};

export function churchReportDateOnly(isoOrDate: string): string {
  return isoOrDate.length >= 10 ? isoOrDate.slice(0, 10) : isoOrDate;
}

export function filterChurchReportLines(
  lines: ChurchReportLine[],
  filters: ChurchReportUiFilters
): ChurchReportLine[] {
  let result = lines;

  if (filters.dateFrom.trim()) {
    const from = filters.dateFrom.trim();
    result = result.filter((l) => churchReportDateOnly(l.occurredAt) >= from);
  }
  if (filters.dateTo.trim()) {
    const to = filters.dateTo.trim();
    result = result.filter((l) => churchReportDateOnly(l.occurredAt) <= to);
  }
  if (filters.direction !== 'all') {
    result = result.filter((l) => l.direction === filters.direction);
  }

  const q = filters.search.trim().toLowerCase();
  if (q) {
    result = result.filter((l) => l.description.toLowerCase().includes(q));
  }

  return result;
}

export function summarizeChurchReportLines(lines: ChurchReportLine[]): {
  totalIncome: number;
  totalExpense: number;
  currencyCode: string;
} {
  const currencyCode = lines[0]?.currencyCode ?? 'BRL';
  const totalIncome = lines
    .filter((l) => l.direction === 'income')
    .reduce((s, l) => s + l.amount, 0);
  const totalExpense = lines
    .filter((l) => l.direction === 'expense')
    .reduce((s, l) => s + l.amount, 0);
  return { totalIncome, totalExpense, currencyCode };
}
