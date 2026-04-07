import type { TransactionDirection } from '@/types/domain/finance';
import type { CompanyId, UserId, UserRole } from '@/types/domain/core';

export interface ApprovalFlowStep {
  order: number;
  roleRequired: UserRole;
}

export interface ApprovalFlow {
  id: string;
  companyId: CompanyId;
  entityType: 'payable_account' | string;
  steps: ApprovalFlowStep[];
}

export interface Attachment {
  id: string;
  companyId: CompanyId;
  entityType: string;
  entityId: string;
  storageUrl: string;
  fileName: string;
  uploadedAt: string;
  uploadedByUserId: UserId;
}

export interface AuditLog {
  id: string;
  companyId: CompanyId;
  actorUserId: UserId;
  action: string;
  entityType: string;
  entityId: string;
  occurredAt: string;
  metadataJson: string | null;
}

export type ReconciliationLineStatus = 'open' | 'matched' | 'exception';

export interface BankStatementLine {
  id: string;
  companyId: CompanyId;
  importBatchId: string;
  bookedAt: string;
  amount: number;
  currencyCode: string;
  description: string;
  matchedTransactionId: string | null;
  status: ReconciliationLineStatus;
}

export interface ChurchReportSummary {
  companyId: CompanyId;
  periodId: string;
  totalIncome: number;
  totalExpense: number;
  currencyCode: string;
}

export type ChurchReportMovementSource =
  | 'financial_transaction'
  | 'church_operational_expense';

/** Linha consolidada do relatório (lançamentos + despesas operacionais da igreja). */
export interface ChurchReportLine {
  id: string;
  source: ChurchReportMovementSource;
  occurredAt: string;
  description: string;
  amount: number;
  direction: TransactionDirection;
  currencyCode: string;
  /** Centro de custo (transação) ou tipo de despesa da igreja */
  referenceKey: string | null;
}
