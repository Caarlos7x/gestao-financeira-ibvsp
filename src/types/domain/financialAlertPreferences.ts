export const FINANCIAL_ALERT_PREFERENCES_VERSION = 1 as const;

/** Nível do farol (semáforo) para resumos na interface. */
export type TrafficLightLevel = 'green' | 'yellow' | 'red';

/**
 * Preferências de alertas financeiros (persistidas no cliente; futuro: API).
 * A “liquidez” usa a soma dos saldos restantes dos orçamentos como proxy até haver módulo de caixa.
 */
export interface FinancialAlertPreferences {
  version: typeof FINANCIAL_ALERT_PREFERENCES_VERSION;
  enableLiquidityAlerts: boolean;
  /** Em BRL: abaixo disso = amarelo (se ainda ≥ 0); abaixo de zero = vermelho. */
  minimumLiquidityThresholdBrl: number;
  enablePayableDueAlerts: boolean;
  /** Dias até o vencimento para considerar “vencendo”. */
  payableDueSoonDays: number;
  enablePendingPayableAlerts: boolean;
  /** Contas agendadas entram no farol “pendências de pagamento”. */
  includeScheduledInPendingReview: boolean;
}

export const DEFAULT_FINANCIAL_ALERT_PREFERENCES: FinancialAlertPreferences = {
  version: FINANCIAL_ALERT_PREFERENCES_VERSION,
  enableLiquidityAlerts: true,
  minimumLiquidityThresholdBrl: 5_000,
  enablePayableDueAlerts: true,
  payableDueSoonDays: 7,
  enablePendingPayableAlerts: true,
  includeScheduledInPendingReview: true,
};
