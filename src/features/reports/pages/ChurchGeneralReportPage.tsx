import { RequireSelectedCompany } from '@/components/shared/RequireSelectedCompany';
import { Button } from '@/components/ui/buttons';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { useRepository } from '@/context/RepositoryContext';
import {
  churchReportDateOnly,
  filterChurchReportLines,
  summarizeChurchReportLines,
  type ChurchReportUiFilters,
} from '@/features/reports/domain/filterChurchReportLines';
import { downloadChurchReportPdf } from '@/features/reports/export/exportChurchReportPdf';
import {
  downloadChurchReportExcel,
  type ChurchReportSheetRow,
} from '@/features/reports/export/exportChurchReportXlsx';
import styles from '@/features/reports/pages/ChurchGeneralReportPage.module.css';
import type {
  BudgetPeriod,
  ChurchOperationalExpense,
  ChurchReportLine,
  CostCenter,
} from '@/types/domain';
import { formatChurchExpenseTypePt } from '@/utils/domainLabelsPtBR';
import { formatCurrency } from '@/utils/formatCurrency';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function ChurchGeneralReportPage() {
  const repository = useRepository();

  return (
    <section className="page">
      <PageHeader
        title="Relatório geral da igreja"
        description="Consolide receitas e despesas por período, filtre movimentos e exporte em Excel ou PDF."
      />
      <RequireSelectedCompany>
        {(companyId) => (
          <ChurchReportBody repository={repository} companyId={companyId} />
        )}
      </RequireSelectedCompany>
    </section>
  );
}

type ChurchReportBodyProps = {
  repository: ReturnType<typeof useRepository>;
  companyId: string;
};

function movementTypeLabel(line: ChurchReportLine): string {
  if (line.direction === 'income') {
    return UI_MESSAGES_PT_BR.churchReportTypeIncome;
  }
  return line.source === 'church_operational_expense'
    ? UI_MESSAGES_PT_BR.churchReportTypeChurchExpense
    : UI_MESSAGES_PT_BR.churchReportTypeExpense;
}

function resolveLineDetail(
  line: ChurchReportLine,
  centerById: Map<string, string>
): string {
  if (line.source === 'financial_transaction') {
    if (!line.referenceKey) {
      return '—';
    }
    return centerById.get(line.referenceKey) ?? line.referenceKey;
  }
  if (!line.referenceKey) {
    return '—';
  }
  return formatChurchExpenseTypePt(
    line.referenceKey as ChurchOperationalExpense['expenseType']
  );
}

function ChurchReportBody({ repository, companyId }: ChurchReportBodyProps) {
  const [periods, setPeriods] = useState<BudgetPeriod[]>([]);
  const [periodId, setPeriodId] = useState('');
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [lines, setLines] = useState<ChurchReportLine[]>([]);
  const [filters, setFilters] = useState<ChurchReportUiFilters>({
    dateFrom: '',
    dateTo: '',
    direction: 'all',
    search: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      repository.listBudgetPeriods(companyId),
      repository.listCostCenters(companyId),
    ])
      .then(([periodRows, ccRows]) => {
        if (!cancelled) {
          setPeriods(periodRows);
          setCostCenters(ccRows);
          setPeriodId((current) => {
            if (
              current &&
              periodRows.some((p) => p.id === current)
            ) {
              return current;
            }
            return periodRows[0]?.id ?? '';
          });
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(
            cause instanceof Error ? cause.message : UI_MESSAGES_PT_BR.loadFailed
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [repository, companyId]);

  useEffect(() => {
    if (!periodId) {
      setLines([]);
      return;
    }
    let cancelled = false;
    repository
      .listChurchReportMovements(companyId, periodId)
      .then((rows) => {
        if (!cancelled) {
          setLines(rows);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(
            cause instanceof Error ? cause.message : UI_MESSAGES_PT_BR.loadFailed
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [repository, companyId, periodId]);

  const selectedPeriod = periods.find((p) => p.id === periodId);

  useEffect(() => {
    const period = periods.find((p) => p.id === periodId);
    if (!period) {
      return;
    }
    setFilters((previous) => ({
      ...previous,
      dateFrom: period.startDate,
      dateTo: period.endDate,
    }));
  }, [periodId, periods]);

  const centerById = useMemo(() => {
    const map = new Map<string, string>();
    for (const cc of costCenters) {
      map.set(cc.id, cc.name);
    }
    return map;
  }, [costCenters]);

  const filteredLines = useMemo(
    () => filterChurchReportLines(lines, filters),
    [lines, filters]
  );

  const summary = useMemo(
    () => summarizeChurchReportLines(filteredLines),
    [filteredLines]
  );

  const buildExportRows = useCallback((): ChurchReportSheetRow[] => {
    return filteredLines.map((line) => ({
      Data: churchReportDateOnly(line.occurredAt),
      Tipo: movementTypeLabel(line),
      Descrição: line.description,
      Detalhe: resolveLineDetail(line, centerById),
      'Valor (R$)': formatCurrency(
        line.amount,
        line.currencyCode,
        'pt-BR'
      ),
    }));
  }, [filteredLines, centerById]);

  const handleExportExcel = useCallback(() => {
    const slug = `${UI_MESSAGES_PT_BR.churchReportExportFileSlug}-${periodId || 'periodo'}`;
    downloadChurchReportExcel(buildExportRows(), slug);
  }, [buildExportRows, periodId]);

  const handleExportPdf = useCallback(() => {
    const periodHint = selectedPeriod
      ? `${selectedPeriod.startDate} – ${selectedPeriod.endDate}`
      : periodId;
    const subtitle = `Período: ${periodHint} · Filtros aplicados (${filteredLines.length} movimento(s))`;
    const headRow = [
      UI_MESSAGES_PT_BR.churchReportTableDate,
      UI_MESSAGES_PT_BR.churchReportTableType,
      UI_MESSAGES_PT_BR.churchReportTableDescription,
      UI_MESSAGES_PT_BR.churchReportTableDetail,
      UI_MESSAGES_PT_BR.churchReportTableAmount,
    ];
    const body = filteredLines.map((line) => [
      churchReportDateOnly(line.occurredAt),
      movementTypeLabel(line),
      line.description,
      resolveLineDetail(line, centerById),
      formatCurrency(line.amount, line.currencyCode, 'pt-BR'),
    ]);
    downloadChurchReportPdf({
      title: 'Relatório geral da igreja',
      subtitle,
      headRow,
      body,
      fileBaseName: `${UI_MESSAGES_PT_BR.churchReportExportFileSlug}-${periodId || 'periodo'}`,
    });
  }, [filteredLines, selectedPeriod, periodId, centerById]);

  if (loading) {
    return <p className="state-message">{UI_MESSAGES_PT_BR.loading}</p>;
  }
  if (error) {
    return <p className="state-message">{error}</p>;
  }
  if (periods.length === 0) {
    return (
      <p className="state-message">{UI_MESSAGES_PT_BR.churchReportNoPeriods}</p>
    );
  }

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.exports}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={filteredLines.length === 0}
          >
            {UI_MESSAGES_PT_BR.churchReportExportExcel}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            disabled={filteredLines.length === 0}
          >
            {UI_MESSAGES_PT_BR.churchReportExportPdf}
          </Button>
        </div>
      </div>

      <div className={styles.filters}>
        <label className={styles.filterField}>
          <span className={styles.filterLabel}>
            {UI_MESSAGES_PT_BR.churchReportPeriod}
          </span>
          <select
            className={styles.filterSelect}
            value={periodId}
            onChange={(event) => setPeriodId(event.target.value)}
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.startDate} → {p.endDate}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.filterField}>
          <span className={styles.filterLabel}>
            {UI_MESSAGES_PT_BR.churchReportDateFrom}
          </span>
          <input
            className={styles.filterInput}
            type="date"
            value={filters.dateFrom}
            onChange={(event) =>
              setFilters((f) => ({ ...f, dateFrom: event.target.value }))
            }
          />
        </label>
        <label className={styles.filterField}>
          <span className={styles.filterLabel}>
            {UI_MESSAGES_PT_BR.churchReportDateTo}
          </span>
          <input
            className={styles.filterInput}
            type="date"
            value={filters.dateTo}
            onChange={(event) =>
              setFilters((f) => ({ ...f, dateTo: event.target.value }))
            }
          />
        </label>
        <label className={styles.filterField}>
          <span className={styles.filterLabel}>
            {UI_MESSAGES_PT_BR.churchReportDirection}
          </span>
          <select
            className={styles.filterSelect}
            value={filters.direction}
            onChange={(event) =>
              setFilters((f) => ({
                ...f,
                direction: event.target.value as ChurchReportUiFilters['direction'],
              }))
            }
          >
            <option value="all">
              {UI_MESSAGES_PT_BR.churchReportDirectionAll}
            </option>
            <option value="income">
              {UI_MESSAGES_PT_BR.churchReportDirectionIncome}
            </option>
            <option value="expense">
              {UI_MESSAGES_PT_BR.churchReportDirectionExpense}
            </option>
          </select>
        </label>
        <label className={`${styles.filterField} ${styles.searchField}`}>
          <span className={styles.filterLabel}>
            {UI_MESSAGES_PT_BR.churchReportSearchPlaceholder}
          </span>
          <input
            className={styles.filterInput}
            type="search"
            placeholder={UI_MESSAGES_PT_BR.churchReportSearchPlaceholder}
            value={filters.search}
            onChange={(event) =>
              setFilters((f) => ({ ...f, search: event.target.value }))
            }
          />
        </label>
      </div>

      <div className="grid-cards">
        <Card variant="metric" title="Receitas">
          <p className="metric">
            {formatCurrency(
              summary.totalIncome,
              summary.currencyCode,
              'pt-BR'
            )}
          </p>
        </Card>
        <Card variant="metric" title="Despesas">
          <p className="metric">
            {formatCurrency(
              summary.totalExpense,
              summary.currencyCode,
              'pt-BR'
            )}
          </p>
        </Card>
        <Card variant="metric" title="Saldo (filtros)">
          <p className="metric">
            {formatCurrency(
              summary.totalIncome - summary.totalExpense,
              summary.currencyCode,
              'pt-BR'
            )}
          </p>
        </Card>
      </div>

      <div className={styles.tableWrap}>
        <Card title="Movimentos" padded>
          {filteredLines.length === 0 ? (
            <p className={styles.emptyTable}>
              {lines.length === 0
                ? UI_MESSAGES_PT_BR.noReportForPeriod
                : UI_MESSAGES_PT_BR.churchReportNoRowsFiltered}
            </p>
          ) : (
            <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{UI_MESSAGES_PT_BR.churchReportTableDate}</th>
                  <th>{UI_MESSAGES_PT_BR.churchReportTableType}</th>
                  <th>{UI_MESSAGES_PT_BR.churchReportTableDescription}</th>
                  <th>{UI_MESSAGES_PT_BR.churchReportTableDetail}</th>
                  <th>{UI_MESSAGES_PT_BR.churchReportTableAmount}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLines.map((line) => (
                  <tr key={`${line.source}-${line.id}`}>
                    <td>{churchReportDateOnly(line.occurredAt)}</td>
                    <td>{movementTypeLabel(line)}</td>
                    <td>{line.description}</td>
                    <td>{resolveLineDetail(line, centerById)}</td>
                    <td className={styles.numeric}>
                      {formatCurrency(
                        line.amount,
                        line.currencyCode,
                        'pt-BR'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
