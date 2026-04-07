import { describe, expect, it } from 'vitest';
import { PAYABLE_SHEET_COLUMNS } from '@/constants/sheetColumns';
import { mapPayableSheetRow } from '@/services/google-sheets/mappers/mapPayableRow';

describe('mapPayableSheetRow', () => {
  it('maps normalized sheet columns to a payable model', () => {
    const payable = mapPayableSheetRow({
      [PAYABLE_SHEET_COLUMNS.id]: 'ap-1',
      [PAYABLE_SHEET_COLUMNS.companyId]: '11111111-1111-4111-8111-111111111101',
      [PAYABLE_SHEET_COLUMNS.supplierId]: 'sup-1',
      [PAYABLE_SHEET_COLUMNS.amount]: 4200,
      [PAYABLE_SHEET_COLUMNS.currencyCode]: 'BRL',
      [PAYABLE_SHEET_COLUMNS.dueDate]: '2025-04-15',
      [PAYABLE_SHEET_COLUMNS.status]: 'pending_approval',
    });

    expect(payable.status).toBe('pending_approval');
    expect(payable.amount).toBe(4200);
  });
});
