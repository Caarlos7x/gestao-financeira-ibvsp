import { Card } from '@/components/ui/Card';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { DASHBOARD_CHART_COLORS } from '@/features/dashboard/chartTokens';
import type {
  CostCenterExpenseRow,
  DirectionTotals,
  MonthlyMovementRow,
} from '@/features/dashboard/domain/aggregateMovements';
import { useMatchMedia } from '@/hooks/useMatchMedia';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import styles from '@/features/dashboard/components/DashboardMovementsCharts.module.css';

type DashboardMovementsChartsProps = {
  monthlyRows: MonthlyMovementRow[];
  directionTotals: DirectionTotals;
  costCenterRows: CostCenterExpenseRow[];
  currencyCode: string;
};

function formatAxisValue(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    notation: Math.abs(value) >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: 0,
  }).format(value);
}

const COMPACT_CHARTS_QUERY = '(max-width: 40rem)';

export function DashboardMovementsCharts({
  monthlyRows,
  directionTotals,
  costCenterRows,
  currencyCode,
}: DashboardMovementsChartsProps) {
  const isCompactCharts = useMatchMedia(COMPACT_CHARTS_QUERY);
  const axisTick = {
    fill: DASHBOARD_CHART_COLORS.axis,
    fontSize: isCompactCharts ? 9 : 11,
  } as const;
  const yAxisWidth = isCompactCharts ? 38 : 44;
  const costCenterAxisWidth = isCompactCharts ? 104 : 132;
  const pieRadii = isCompactCharts
    ? { inner: 40, outer: 64 }
    : { inner: 56, outer: 88 };

  const monthlyData = monthlyRows.map((row) => ({
    label: row.label,
    income: row.income,
    expenseTx: row.expenseTransactions,
    church: row.churchExpense,
  }));

  const pieData = [
    {
      name: UI_MESSAGES_PT_BR.dashboardLegendIncome,
      value: directionTotals.income,
      color: DASHBOARD_CHART_COLORS.income,
    },
    {
      name: UI_MESSAGES_PT_BR.dashboardLegendTotalExpense,
      value: directionTotals.expense,
      color: DASHBOARD_CHART_COLORS.expense,
    },
  ].filter((d) => d.value > 0);

  const costData = costCenterRows.slice(0, 12).map((row) => ({
    name:
      row.name.length > 28 ? `${row.name.slice(0, 26)}…` : row.name,
    amount: row.amount,
    fullName: row.name,
  }));

  const hasMonthly = monthlyData.some(
    (d) => d.income > 0 || d.expenseTx > 0 || d.church > 0
  );
  const hasPie = pieData.length > 0;
  const hasCostBars = costData.length > 0;

  return (
    <section className={styles.section} aria-label={UI_MESSAGES_PT_BR.dashboardChartsSectionTitle}>
      <h2 className={styles.sectionTitle}>
        {UI_MESSAGES_PT_BR.dashboardChartsSectionTitle}
      </h2>
      <p className={styles.sectionLead}>
        {UI_MESSAGES_PT_BR.dashboardChartsSectionLead}
      </p>

      {!hasMonthly && !hasPie && !hasCostBars ? (
        <p className={styles.empty}>{UI_MESSAGES_PT_BR.dashboardChartNoMovements}</p>
      ) : (
        <div className={styles.grid}>
          <div className={styles.gridTwo}>
            {hasMonthly ? (
              <Card className={styles.chartCard} padded>
                <h3 className={styles.chartCardTitle}>
                  {UI_MESSAGES_PT_BR.dashboardChartMonthlyTitle}
                </h3>
                <p className={styles.chartCardSubtitle}>
                  {UI_MESSAGES_PT_BR.dashboardChartMonthlySubtitle}
                </p>
                <div className={styles.chartWrap}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyData}
                      margin={{
                        top: 8,
                        right: isCompactCharts ? 4 : 8,
                        left: 0,
                        bottom: isCompactCharts ? 4 : 0,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={DASHBOARD_CHART_COLORS.grid}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={axisTick}
                        tickLine={false}
                        axisLine={{ stroke: DASHBOARD_CHART_COLORS.grid }}
                      />
                      <YAxis
                        tickFormatter={formatAxisValue}
                        tick={axisTick}
                        tickLine={false}
                        axisLine={{ stroke: DASHBOARD_CHART_COLORS.grid }}
                        width={yAxisWidth}
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          const n =
                            typeof value === 'number'
                              ? value
                              : Number(value ?? 0);
                          const label =
                            typeof name === 'string' ? name : String(name ?? '');
                          return [
                            formatCurrency(
                              Number.isFinite(n) ? n : 0,
                              currencyCode,
                              'pt-BR'
                            ),
                            label,
                          ];
                        }}
                        labelStyle={{ fontWeight: 600 }}
                        contentStyle={{
                          borderRadius: '0.625rem',
                          border: '1px solid rgba(124, 112, 168, 0.22)',
                        }}
                      />
                      <Legend
                        wrapperStyle={{
                          fontSize: isCompactCharts ? '0.6875rem' : '0.8125rem',
                          lineHeight: '1.25',
                        }}
                      />
                      <Bar
                        name={UI_MESSAGES_PT_BR.dashboardLegendIncome}
                        dataKey="income"
                        fill={DASHBOARD_CHART_COLORS.income}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        name={UI_MESSAGES_PT_BR.dashboardLegendExpenseTx}
                        dataKey="expenseTx"
                        fill={DASHBOARD_CHART_COLORS.expense}
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        name={UI_MESSAGES_PT_BR.dashboardLegendChurchExpense}
                        dataKey="church"
                        fill={DASHBOARD_CHART_COLORS.church}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            ) : null}

            {hasPie ? (
              <Card className={styles.chartCard} padded>
                <h3 className={styles.chartCardTitle}>
                  {UI_MESSAGES_PT_BR.dashboardChartDistributionTitle}
                </h3>
                <p className={styles.chartCardSubtitle}>
                  {UI_MESSAGES_PT_BR.dashboardChartDistributionSubtitle}
                </p>
                <div className={styles.chartWrap}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={pieRadii.inner}
                        outerRadius={pieRadii.outer}
                        paddingAngle={2}
                        label={
                          isCompactCharts
                            ? false
                            : ({ name, percent }) => {
                                const pct = Math.round((percent ?? 0) * 100);
                                return `${name ?? ''} (${pct}%)`;
                              }
                        }
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => {
                          const n =
                            typeof value === 'number'
                              ? value
                              : Number(value ?? 0);
                          return formatCurrency(
                            Number.isFinite(n) ? n : 0,
                            currencyCode,
                            'pt-BR'
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            ) : null}
          </div>

          {hasCostBars ? (
            <Card className={`${styles.chartCard} ${styles.fullWidth}`} padded>
              <h3 className={styles.chartCardTitle}>
                {UI_MESSAGES_PT_BR.dashboardChartCostCenterTitle}
              </h3>
              <p className={styles.chartCardSubtitle}>
                {UI_MESSAGES_PT_BR.dashboardChartCostCenterSubtitle}
              </p>
              <div className={`${styles.chartWrap} ${styles.chartWrapTall}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={costData}
                    margin={{
                      top: 8,
                      right: isCompactCharts ? 12 : 24,
                      left: isCompactCharts ? 4 : 8,
                      bottom: 8,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={DASHBOARD_CHART_COLORS.grid}
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tickFormatter={formatAxisValue}
                      tick={axisTick}
                      axisLine={{ stroke: DASHBOARD_CHART_COLORS.grid }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={costCenterAxisWidth}
                      tick={axisTick}
                      axisLine={{ stroke: DASHBOARD_CHART_COLORS.grid }}
                    />
                    <Tooltip
                      formatter={(value) => {
                        const n =
                          typeof value === 'number'
                            ? value
                            : Number(value ?? 0);
                        return formatCurrency(
                          Number.isFinite(n) ? n : 0,
                          currencyCode,
                          'pt-BR'
                        );
                      }}
                      labelFormatter={(_, payload) => {
                        const row = payload?.[0]?.payload as
                          | { fullName?: string; name?: string }
                          | undefined;
                        return row?.fullName ?? row?.name ?? '';
                      }}
                    />
                    <Bar
                      dataKey="amount"
                      name={UI_MESSAGES_PT_BR.dashboardLegendExpenseTx}
                      fill={DASHBOARD_CHART_COLORS.accent}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          ) : hasMonthly || hasPie ? (
            <p className={styles.empty}>
              {UI_MESSAGES_PT_BR.dashboardChartNoCostCenterExpense}
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
