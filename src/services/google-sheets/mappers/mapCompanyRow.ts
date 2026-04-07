import { z } from 'zod';
import type { Company } from '@/types/domain';
import { COMPANY_SHEET_COLUMNS } from '@/constants/sheetColumns';
import type { SheetRow } from '@/services/google-sheets/googleSheetsRepository';

const companyRowSchema = z.object({
  [COMPANY_SHEET_COLUMNS.id]: z.string().min(1),
  [COMPANY_SHEET_COLUMNS.name]: z.string().min(1),
  [COMPANY_SHEET_COLUMNS.createdAt]: z.string().min(1),
});

export function mapCompanySheetRow(row: SheetRow): Company {
  const parsed = companyRowSchema.safeParse(row);
  if (!parsed.success) {
    throw new Error('Invalid company sheet row shape.');
  }

  const data = parsed.data;
  return {
    id: data[COMPANY_SHEET_COLUMNS.id],
    name: data[COMPANY_SHEET_COLUMNS.name],
    createdAt: data[COMPANY_SHEET_COLUMNS.createdAt],
  };
}
