import { Button } from '@/components/ui/buttons';
import { Text } from '@/components/ui/Text';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import type { FinancialAlertPreferences } from '@/types/domain';
import type { Dispatch, SetStateAction } from 'react';
import styles from '@/features/settings/components/SettingsAlertsForm.module.css';

type AlertPreferencesFormProps = {
  preferences: FinancialAlertPreferences;
  setPreferences: Dispatch<SetStateAction<FinancialAlertPreferences>>;
  onSave: () => void;
  onReset: () => void;
  saveMessage: string | null;
  disabled: boolean;
};

export function AlertPreferencesForm({
  preferences,
  setPreferences,
  onSave,
  onReset,
  saveMessage,
  disabled,
}: AlertPreferencesFormProps) {
  return (
    <div>
      <Text variant="lead" className="card-integrated-lead">
        {UI_MESSAGES_PT_BR.settingsAlertsCardLead}
      </Text>

      <h3 className={styles.sectionTitle}>
        {UI_MESSAGES_PT_BR.settingsLiquiditySection}
      </h3>
      <p className={styles.hint}>{UI_MESSAGES_PT_BR.settingsLiquidityHelp}</p>
      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={preferences.enableLiquidityAlerts}
          onChange={(event) =>
            setPreferences((previous) => ({
              ...previous,
              enableLiquidityAlerts: event.target.checked,
            }))
          }
          disabled={disabled}
        />
        <span className={styles.checkboxLabel}>
          {UI_MESSAGES_PT_BR.settingsLiquidityEnable}
        </span>
      </label>
      <div className={styles.field}>
        <span className={styles.label}>
          {UI_MESSAGES_PT_BR.settingsLiquidityThreshold}
        </span>
        <input
          className={styles.input}
          type="number"
          min={0}
          step={100}
          value={preferences.minimumLiquidityThresholdBrl}
          onChange={(event) =>
            setPreferences((previous) => ({
              ...previous,
              minimumLiquidityThresholdBrl: Math.max(
                0,
                Number(event.target.value) || 0
              ),
            }))
          }
          disabled={disabled || !preferences.enableLiquidityAlerts}
        />
        <span className={styles.hint} style={{ marginBottom: 0 }}>
          {UI_MESSAGES_PT_BR.settingsLiquidityThresholdHelp}
        </span>
      </div>

      <h3 className={styles.sectionTitle}>
        {UI_MESSAGES_PT_BR.settingsPayablesSection}
      </h3>
      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={preferences.enablePayableDueAlerts}
          onChange={(event) =>
            setPreferences((previous) => ({
              ...previous,
              enablePayableDueAlerts: event.target.checked,
            }))
          }
          disabled={disabled}
        />
        <span className={styles.checkboxLabel}>
          {UI_MESSAGES_PT_BR.settingsPayableDueEnable}
        </span>
      </label>
      <div className={styles.field}>
        <span className={styles.label}>
          {UI_MESSAGES_PT_BR.settingsPayableDueDays}
        </span>
        <input
          className={styles.input}
          type="number"
          min={0}
          max={365}
          step={1}
          value={preferences.payableDueSoonDays}
          onChange={(event) =>
            setPreferences((previous) => ({
              ...previous,
              payableDueSoonDays: Math.min(
                365,
                Math.max(0, Math.floor(Number(event.target.value) || 0))
              ),
            }))
          }
          disabled={disabled || !preferences.enablePayableDueAlerts}
        />
      </div>
      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={preferences.enablePendingPayableAlerts}
          onChange={(event) =>
            setPreferences((previous) => ({
              ...previous,
              enablePendingPayableAlerts: event.target.checked,
            }))
          }
          disabled={disabled}
        />
        <span className={styles.checkboxLabel}>
          {UI_MESSAGES_PT_BR.settingsPayablePendingEnable}
        </span>
      </label>
      <label className={styles.checkboxRow}>
        <input
          type="checkbox"
          checked={preferences.includeScheduledInPendingReview}
          onChange={(event) =>
            setPreferences((previous) => ({
              ...previous,
              includeScheduledInPendingReview: event.target.checked,
            }))
          }
          disabled={disabled || !preferences.enablePendingPayableAlerts}
        />
        <span className={styles.checkboxLabel}>
          {UI_MESSAGES_PT_BR.settingsPayableScheduledEnable}
        </span>
      </label>

      <div className={styles.actions}>
        <Button type="button" onClick={onSave} disabled={disabled}>
          {UI_MESSAGES_PT_BR.settingsAlertsSave}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={disabled}
        >
          {UI_MESSAGES_PT_BR.settingsAlertsReset}
        </Button>
      </div>
      {saveMessage ? (
        <p
          className={`${styles.feedback} ${
            saveMessage.includes('salvas') ? 'text-success' : 'text-danger'
          }`}
        >
          {saveMessage}
        </p>
      ) : null}
    </div>
  );
}
