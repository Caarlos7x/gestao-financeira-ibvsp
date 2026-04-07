export const COMPANY_SHEET_COLUMNS = {
  id: 'id',
  name: 'name',
  createdAt: 'created_at',
} as const;

export const PAYABLE_SHEET_COLUMNS = {
  id: 'id',
  companyId: 'company_id',
  supplierId: 'supplier_id',
  amount: 'amount',
  currencyCode: 'currency_code',
  dueDate: 'due_date',
  status: 'status',
} as const;
