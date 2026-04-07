import { describe, expect, it } from 'vitest';
import { COMPANY_SHEET_COLUMNS } from '@/constants/sheetColumns';
import { mapCompanySheetRow } from '@/services/google-sheets/mappers/mapCompanyRow';

describe('mapCompanySheetRow', () => {
  it('maps normalized sheet columns to a company model', () => {
    const company = mapCompanySheetRow({
      [COMPANY_SHEET_COLUMNS.id]: '11111111-1111-4111-8111-111111111101',
      [COMPANY_SHEET_COLUMNS.name]: 'Acme',
      [COMPANY_SHEET_COLUMNS.createdAt]: '2024-01-01T00:00:00.000Z',
    });

    expect(company).toEqual({
      id: '11111111-1111-4111-8111-111111111101',
      name: 'Acme',
      createdAt: '2024-01-01T00:00:00.000Z',
    });
  });
});
