import {
  DEFAULT_FINANCIAL_ALERT_PREFERENCES,
  FINANCIAL_ALERT_PREFERENCES_VERSION,
  type FinancialAlertPreferences,
} from '@/types/domain';
import { z } from 'zod';

export const financialAlertPreferencesSchema = z.object({
  version: z.literal(FINANCIAL_ALERT_PREFERENCES_VERSION),
  enableLiquidityAlerts: z.boolean(),
  minimumLiquidityThresholdBrl: z
    .number()
    .min(0, 'Valor mínimo inválido')
    .max(999_999_999),
  enablePayableDueAlerts: z.boolean(),
  payableDueSoonDays: z
    .number()
    .int()
    .min(0)
    .max(365),
  enablePendingPayableAlerts: z.boolean(),
  includeScheduledInPendingReview: z.boolean(),
});

export function parseFinancialAlertPreferences(
  raw: unknown
): FinancialAlertPreferences {
  const parsed = financialAlertPreferencesSchema.safeParse(raw);
  if (parsed.success) {
    return parsed.data;
  }
  return DEFAULT_FINANCIAL_ALERT_PREFERENCES;
}
