import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { useRepository } from '@/context/RepositoryContext';
import {
  analyzePayablesForAlerts,
  evaluateLiquidityFarol,
  totalBudgetLiquidityProxy,
} from '@/domain/financialAlerts';
import { TrafficLightBadge } from '@/features/settings/components/TrafficLightBadge';
import styles from '@/features/settings/components/SettingsAlertsForm.module.css';
import type { Budget, FinancialAlertPreferences, PayableAccount } from '@/types/domain';
import { formatCurrency } from '@/utils/formatCurrency';
import { todayLocalYmd } from '@/utils/todayLocalYmd';
import { useEffect, useState } from 'react';

type FinancialFarolPreviewCardProps = {
  companyId: string;
  preferences: FinancialAlertPreferences;
};

export function FinancialFarolPreviewCard({
  companyId,
  preferences,
}: FinancialFarolPreviewCardProps) {
  const repository = useRepository();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [payables, setPayables] = useState<PayableAccount[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      repository.listBudgets(companyId),
      repository.listPayables(companyId),
    ])
      .then(([budgetRows, payableRows]) => {
        if (!cancelled) {
          setBudgets(budgetRows);
          setPayables(payableRows);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBudgets([]);
          setPayables([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [repository, companyId]);

  const liquidityProxy = totalBudgetLiquidityProxy(budgets);
  const liquidityLight = evaluateLiquidityFarol(liquidityProxy, preferences);
  const payablesAnalysis = analyzePayablesForAlerts(
    payables,
    todayLocalYmd(),
    preferences
  );
  const { detail } = payablesAnalysis;

  return (
    <div>
      <div className={styles.previewGrid}>
        <div className={styles.previewItem}>
          <TrafficLightBadge level={liquidityLight} />
          <p className={styles.previewBlockTitle}>
            {UI_MESSAGES_PT_BR.settingsFarolLiquidity}
          </p>
          <ul className={styles.previewStats}>
            <li>
              {UI_MESSAGES_PT_BR.settingsFarolLiquidityValue}:{' '}
              <span className={styles.monoValue}>
                {formatCurrency(liquidityProxy, 'BRL', 'pt-BR')}
              </span>
            </li>
          </ul>
        </div>
        <div className={styles.previewItem}>
          <TrafficLightBadge level={payablesAnalysis.dueLight} />
          <p className={styles.previewBlockTitle}>
            {UI_MESSAGES_PT_BR.settingsFarolDue}
          </p>
          <ul className={styles.previewStats}>
            <li>
              {UI_MESSAGES_PT_BR.settingsFarolOverdue}: {detail.overdueCount}
            </li>
            <li>
              {UI_MESSAGES_PT_BR.settingsFarolDueSoon}: {detail.dueSoonCount}
            </li>
          </ul>
        </div>
        <div className={styles.previewItem}>
          <TrafficLightBadge level={payablesAnalysis.pendingLight} />
          <p className={styles.previewBlockTitle}>
            {UI_MESSAGES_PT_BR.settingsFarolPending}
          </p>
          <ul className={styles.previewStats}>
            <li>
              {UI_MESSAGES_PT_BR.settingsFarolPendingDraft}:{' '}
              {detail.pendingWorkflowCount}
            </li>
            <li>
              {UI_MESSAGES_PT_BR.settingsFarolScheduled}:{' '}
              {detail.scheduledAwaitingPaymentCount}
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.legend}>
        <div className={styles.legendTitle}>
          {UI_MESSAGES_PT_BR.settingsFarolLegendTitle}
        </div>
        {UI_MESSAGES_PT_BR.settingsFarolLegendText}
      </div>
    </div>
  );
}
