export type SheetRow = Record<string, string | number | boolean | null>;

export interface GoogleSheetsReadPort {
  readRange(spreadsheetId: string, rangeA1: string): Promise<SheetRow[]>;
}

export class GoogleSheetsNotConfiguredError extends Error {
  constructor(message = 'Google Sheets adapter is not configured.') {
    super(message);
    this.name = 'GoogleSheetsNotConfiguredError';
  }
}

export const googleSheetsRepositoryPlaceholder: GoogleSheetsReadPort = {
  async readRange() {
    throw new GoogleSheetsNotConfiguredError();
  },
};
