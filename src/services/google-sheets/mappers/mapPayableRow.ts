import { z } from 'zod';
import type { PayableAccount } from '@/types/domain';
import { PAYABLE_SHEET_COLUMNS } from '@/constants/sheetColumns';
import type { SheetRow } from '@/services/google-sheets/googleSheetsRepository';

const statusSchema = z.enum([
  'draft',
  'pending_approval',
  'approved',
  'scheduled',
  'paid',
  'cancelled',
]);

const payableRowSchema = z.object({
  [PAYABLE_SHEET_COLUMNS.id]: z.string().min(1),
  [PAYABLE_SHEET_COLUMNS.companyId]: z.string().min(1),
  [PAYABLE_SHEET_COLUMNS.supplierId]: z.string().min(1),
  [PAYABLE_SHEET_COLUMNS.amount]: z.coerce.number().finite(),
  [PAYABLE_SHEET_COLUMNS.currencyCode]: z.string().min(1),
  [PAYABLE_SHEET_COLUMNS.dueDate]: z.string().min(1),
  [PAYABLE_SHEET_COLUMNS.status]: statusSchema,
});

export function mapPayableSheetRow(row: SheetRow): PayableAccount {
  const parsed = payableRowSchema.safeParse(row);
  if (!parsed.success) {
    throw new Error('Invalid accounts payable sheet row shape.');
  }

  const data = parsed.data;
  return {
    id: data[PAYABLE_SHEET_COLUMNS.id],
    companyId: data[PAYABLE_SHEET_COLUMNS.companyId],
    supplierId: data[PAYABLE_SHEET_COLUMNS.supplierId],
    amount: data[PAYABLE_SHEET_COLUMNS.amount],
    currencyCode: data[PAYABLE_SHEET_COLUMNS.currencyCode],
    dueDate: data[PAYABLE_SHEET_COLUMNS.dueDate],
    status: data[PAYABLE_SHEET_COLUMNS.status],
  };
}
