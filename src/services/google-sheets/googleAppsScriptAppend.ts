/**
 * Envio de dados ao Google Sheets pelo front-end, sem servidor próprio:
 * publique um Google Apps Script como "app da Web" (implantação) que receba POST JSON
 * e grave na planilha. Nunca coloque chave de conta de serviço no bundle do navegador.
 */
export function isGoogleAppsScriptUrlConfigured(): boolean {
  const url = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
  return typeof url === 'string' && url.trim().length > 0;
}

export async function appendRowViaGoogleAppsScript(
  payload: Record<string, unknown>
): Promise<void> {
  const url = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL?.trim();
  if (!url) {
    throw new Error(
      'URL do Google Apps Script não configurada (VITE_GOOGLE_APPS_SCRIPT_URL).'
    );
  }

  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(
      detail
        ? `Falha ao gravar na planilha (${response.status}): ${detail}`
        : `Falha ao gravar na planilha (HTTP ${response.status}).`
    );
  }
}
