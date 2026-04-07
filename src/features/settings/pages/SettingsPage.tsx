import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { useAuthContext } from '@/context/AuthContext';
import { useCompanyContext } from '@/context/CompanyContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Text } from '@/components/ui/Text';
import { AlertPreferencesForm } from '@/features/settings/components/AlertPreferencesForm';
import { FinancialFarolPreviewCard } from '@/features/settings/components/FinancialFarolPreviewCard';
import { useFinancialAlertPreferences } from '@/features/settings/hooks/useFinancialAlertPreferences';
import { permissionsForRole } from '@/domain/permissions';
import {
  appendRowViaGoogleAppsScript,
  isGoogleAppsScriptUrlConfigured,
} from '@/services/google-sheets/googleAppsScriptAppend';
import { formatPermissionPt, formatUserRolePt } from '@/utils/domainLabelsPtBR';
import { useState } from 'react';

export function SettingsPage() {
  const { state } = useAuthContext();
  const { selectedCompanyId } = useCompanyContext();
  const [sheetMessage, setSheetMessage] = useState<string | null>(null);
  const [sheetBusy, setSheetBusy] = useState(false);

  const alertUserId =
    state.status === 'signed_in' ? state.profile.userId : '';
  const {
    preferences,
    setPreferences,
    save,
    resetToDefaults,
    hydrated,
    saveMessage,
  } = useFinancialAlertPreferences(alertUserId, selectedCompanyId);

  if (state.status !== 'signed_in') {
    return null;
  }

  const profile = state.profile;

  const permissions = [...permissionsForRole(profile.role)].sort();

  async function handleTestSheetAppend() {
    setSheetMessage(null);
    setSheetBusy(true);
    try {
      await appendRowViaGoogleAppsScript({
        source: 'financial-platform',
        event: 'settings_test_append',
        at: new Date().toISOString(),
        userEmail: profile.email,
      });
      setSheetMessage('Linha de teste enviada para o Apps Script com sucesso.');
    } catch (cause: unknown) {
      setSheetMessage(
        cause instanceof Error ? cause.message : 'Falha ao enviar para a planilha.'
      );
    } finally {
      setSheetBusy(false);
    }
  }

  const scriptReady = isGoogleAppsScriptUrlConfigured();
  const alertsDisabled = !selectedCompanyId || !hydrated;

  return (
    <section className="page settings-page">
      <PageHeader
        title="Configurações"
        description="Permissões, integrações, alertas financeiros parametrizáveis e pré-visualização do farol com base nos dados atuais da organização."
      />
      <div className="stack">
        <Card title="Papel">
          <Text variant="mono" as="p">
            {formatUserRolePt(profile.role)}
          </Text>
        </Card>
        <Card title="Permissões">
          <ul className="permission-list">
            {permissions.map((permission) => (
              <li key={permission}>{formatPermissionPt(permission)}</li>
            ))}
          </ul>
        </Card>
        <Card title={UI_MESSAGES_PT_BR.settingsAlertsCardTitle} padded>
          {alertsDisabled ? (
            <p className="state-message">
              {UI_MESSAGES_PT_BR.settingsAlertsNeedCompany}
            </p>
          ) : (
            <AlertPreferencesForm
              preferences={preferences}
              setPreferences={setPreferences}
              onSave={save}
              onReset={resetToDefaults}
              saveMessage={saveMessage}
              disabled={false}
            />
          )}
        </Card>
        <Card title={UI_MESSAGES_PT_BR.settingsFarolPreviewTitle} padded>
          {!selectedCompanyId ? (
            <p className="state-message">
              {UI_MESSAGES_PT_BR.settingsAlertsNeedCompany}
            </p>
          ) : (
            <FinancialFarolPreviewCard
              companyId={selectedCompanyId}
              preferences={preferences}
            />
          )}
        </Card>
        <Card title="Google Sheets (sem servidor próprio)">
          <Text variant="lead" className="card-integrated-lead">
            Para gravar linhas a partir do navegador com custo zero de infraestrutura, publique um
            Google Apps Script como aplicativo da Web (POST) e defina{' '}
            <Text variant="mono" as="span">
              VITE_GOOGLE_APPS_SCRIPT_URL
            </Text>{' '}
            no{' '}
            <Text variant="mono" as="span">
              .env
            </Text>
            . Não use chave de conta de serviço no front-end.
          </Text>
          {scriptReady ? (
            <p className="text-success">URL do Apps Script configurada.</p>
          ) : (
            <p className="state-message">
              URL do Apps Script não configurada — apenas dados locais/mock até você conectar.
            </p>
          )}
          <div className="card-actions">
            <Button type="button" disabled={!scriptReady || sheetBusy} onClick={handleTestSheetAppend}>
              {sheetBusy ? 'Enviando…' : 'Enviar linha de teste à planilha'}
            </Button>
          </div>
          {sheetMessage ? (
            <p className={sheetMessage.includes('sucesso') ? 'text-success' : 'text-danger'}>
              {sheetMessage}
            </p>
          ) : null}
        </Card>
      </div>
    </section>
  );
}
