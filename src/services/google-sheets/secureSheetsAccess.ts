/**
 * Google Sheets credentials that can read or write private spreadsheets must not ship in the
 * browser bundle. When those capabilities are required, expose a minimal backend endpoint and
 * keep service accounts or OAuth refresh tokens server-side only.
 */
export class SecureSheetsAccessRequiredError extends Error {
  constructor(
    message = 'Configure a backend proxy before accessing private Google Sheets data.'
  ) {
    super(message);
    this.name = 'SecureSheetsAccessRequiredError';
  }
}

export function assertSheetsAccessIsBrowserSafe(mode: 'public_read' | 'backend_proxy'): void {
  if (mode === 'backend_proxy') {
    throw new SecureSheetsAccessRequiredError();
  }
}
