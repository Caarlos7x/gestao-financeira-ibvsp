import { parseFinancialAlertPreferences } from '@/features/settings/schemas/financialAlertPreferencesSchema';
import {
  DEFAULT_FINANCIAL_ALERT_PREFERENCES,
  type FinancialAlertPreferences,
} from '@/types/domain';
import { useCallback, useEffect, useState } from 'react';

function storageKey(userId: string, companyId: string): string {
  return `financial-platform.alert-prefs.v1:${userId}:${companyId}`;
}

export function useFinancialAlertPreferences(
  userId: string,
  companyId: string | null
) {
  const [preferences, setPreferences] = useState<FinancialAlertPreferences>(
    DEFAULT_FINANCIAL_ALERT_PREFERENCES
  );
  const [hydrated, setHydrated] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) {
      setHydrated(true);
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey(userId, companyId));
      if (raw) {
        const parsed = parseFinancialAlertPreferences(JSON.parse(raw));
        setPreferences(parsed);
      } else {
        setPreferences(DEFAULT_FINANCIAL_ALERT_PREFERENCES);
      }
    } catch {
      setPreferences(DEFAULT_FINANCIAL_ALERT_PREFERENCES);
    } finally {
      setHydrated(true);
    }
  }, [userId, companyId]);

  const save = useCallback(() => {
    if (!companyId) {
      return;
    }
    try {
      localStorage.setItem(
        storageKey(userId, companyId),
        JSON.stringify(preferences)
      );
      setSaveMessage('Preferências de alertas salvas neste navegador.');
    } catch {
      setSaveMessage('Não foi possível salvar (armazenamento indisponível).');
    }
  }, [userId, companyId, preferences]);

  const resetToDefaults = useCallback(() => {
    if (companyId) {
      try {
        localStorage.removeItem(storageKey(userId, companyId));
      } catch {
        /* ignore */
      }
    }
    setPreferences(DEFAULT_FINANCIAL_ALERT_PREFERENCES);
    setSaveMessage(null);
  }, [userId, companyId]);

  return {
    preferences,
    setPreferences,
    save,
    resetToDefaults,
    hydrated,
    saveMessage,
  };
}
