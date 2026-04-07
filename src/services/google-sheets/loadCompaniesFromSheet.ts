import { SHEET_TABS } from '@/constants/sheetTabs';
import { mapCompanySheetRow } from '@/services/google-sheets/mappers/mapCompanyRow';
import type { Company } from '@/types/domain';
import type { GoogleSheetsReadPort } from '@/services/google-sheets/googleSheetsRepository';

export async function loadCompaniesFromSheet(
  port: GoogleSheetsReadPort,
  spreadsheetId: string
): Promise<Company[]> {
  const range = `${SHEET_TABS.companies}!A:Z`;
  const rows = await port.readRange(spreadsheetId, range);
  return rows.map((row) => mapCompanySheetRow(row));
}
