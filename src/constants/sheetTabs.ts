export const SHEET_TABS = {
  companies: 'companies',
  users: 'users',
  costCenters: 'cost_centers',
  budgets: 'budgets',
  allocations: 'allocations',
  assets: 'assets',
  accountsPayable: 'accounts_payable',
  suppliers: 'suppliers',
  auditLogs: 'audit_logs',
} as const;

export type SheetTabName = (typeof SHEET_TABS)[keyof typeof SHEET_TABS];
