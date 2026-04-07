export type CompanyId = string;
export type UserId = string;

export type UserRole =
  | 'admin'
  | 'finance_manager'
  | 'analyst'
  | 'approver'
  | 'viewer';

export interface Company {
  id: CompanyId;
  name: string;
  createdAt: string;
}

export interface User {
  id: UserId;
  companyId: CompanyId;
  email: string;
  displayName: string;
  role: UserRole;
}

export interface AppUserProfile {
  userId: UserId;
  email: string;
  displayName: string;
  /** Nome próprio (cabeçalho e exibições formais) */
  firstName?: string;
  /** Sobrenome */
  lastName?: string;
  role: UserRole;
  companyIds: CompanyId[];
}

export interface CostCenter {
  id: string;
  companyId: CompanyId;
  name: string;
  ownerUserId: UserId | null;
}

export interface BudgetPeriod {
  id: string;
  companyId: CompanyId;
  startDate: string;
  endDate: string;
}

export interface Budget {
  id: string;
  companyId: CompanyId;
  costCenterId: string;
  periodId: string;
  plannedAmount: number;
  actualAmount: number;
  currencyCode: string;
  version: number;
}

export interface Ministry {
  id: string;
  companyId: CompanyId;
  name: string;
  leaderUserId: UserId | null;
  memberUserIds: UserId[];
  linkedCostCenterId: string | null;
}
