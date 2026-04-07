import type { CompanyId, UserId } from '@/types/domain/core';

export interface AllocationSplit {
  costCenterId: string;
  percentage: number;
}

export interface AllocationRule {
  id: string;
  companyId: CompanyId;
  name: string;
  splits: AllocationSplit[];
  traceabilityCode: string;
}

export type AssetStatus = 'active' | 'disposed' | 'maintenance' | 'retired';

export interface Asset {
  id: string;
  companyId: CompanyId;
  name: string;
  category: string;
  ownerUserId: UserId | null;
  acquisitionDate: string;
  acquisitionValue: number;
  currencyCode: string;
  status: AssetStatus;
}

export interface Supplier {
  id: string;
  companyId: CompanyId;
  name: string;
  taxId: string | null;
}

export type PayableAccountStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'scheduled'
  | 'paid'
  | 'cancelled';

export interface PayableAccount {
  id: string;
  companyId: CompanyId;
  supplierId: string;
  amount: number;
  currencyCode: string;
  dueDate: string;
  status: PayableAccountStatus;
}

export type TransactionDirection = 'income' | 'expense';

export interface FinancialTransaction {
  id: string;
  companyId: CompanyId;
  costCenterId: string | null;
  categoryId: string | null;
  amount: number;
  currencyCode: string;
  direction: TransactionDirection;
  occurredAt: string;
  description: string;
}

export interface Category {
  id: string;
  companyId: CompanyId;
  name: string;
  parentCategoryId: string | null;
}

export interface Investment {
  id: string;
  companyId: CompanyId;
  name: string;
  instrumentType: string;
  openedAt: string;
  principalAmount: number;
  currencyCode: string;
}

export interface ChurchOperationalExpense {
  id: string;
  companyId: CompanyId;
  categoryId: string | null;
  amount: number;
  currencyCode: string;
  expenseType: 'maintenance' | 'events' | 'operations' | 'other';
  occurredAt: string;
  description: string;
}
