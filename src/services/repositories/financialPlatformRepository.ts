import type {
  AllocationRule,
  AllocationSplit,
  AppUserProfile,
  Asset,
  AssetStatus,
  AuditLog,
  BankStatementLine,
  Budget,
  BudgetPeriod,
  ChurchOperationalExpense,
  ChurchReportLine,
  ChurchReportSummary,
  Company,
  CompanyId,
  CostCenter,
  FinancialTransaction,
  Investment,
  Ministry,
  PayableAccount,
  PayableAccountStatus,
  Supplier,
  TransactionDirection,
  UserId,
} from '@/types/domain';

export type CreateFinancialTransactionInput = {
  description: string;
  amount: number;
  currencyCode: string;
  direction: TransactionDirection;
  occurredAt: string;
  costCenterId: string | null;
  categoryId: string | null;
};

export type CreatePayableAccountInput = {
  supplierId: string;
  amount: number;
  currencyCode: string;
  dueDate: string;
  status?: PayableAccountStatus;
};

export type CreateChurchOperationalExpenseInput = {
  description: string;
  amount: number;
  currencyCode: string;
  expenseType: ChurchOperationalExpense['expenseType'];
  occurredAt: string;
  categoryId: string | null;
};

export type CreateSupplierInput = {
  name: string;
  taxId: string | null;
};

export type CreateCostCenterInput = {
  name: string;
  ownerUserId: UserId | null;
};

export type CreateBudgetInput = {
  costCenterId: string;
  periodId: string;
  plannedAmount: number;
  currencyCode: string;
};

export type CreateAssetInput = {
  name: string;
  category: string;
  ownerUserId: UserId | null;
  acquisitionDate: string;
  acquisitionValue: number;
  currencyCode: string;
  status: AssetStatus;
};

export type CreateMinistryInput = {
  name: string;
  leaderUserId: UserId | null;
  linkedCostCenterId: string | null;
};

export type CreateInvestmentInput = {
  name: string;
  instrumentType: string;
  openedAt: string;
  principalAmount: number;
  currencyCode: string;
};

export type CreateBankStatementLineInput = {
  bookedAt: string;
  amount: number;
  currencyCode: string;
  description: string;
};

export type CreateAllocationRuleInput = {
  name: string;
  traceabilityCode: string;
  splits: AllocationSplit[];
};

export interface FinancialPlatformRepository {
  getUserProfileForEmail(email: string): Promise<AppUserProfile | null>;
  listCompanies(): Promise<Company[]>;
  listCostCenters(companyId: CompanyId): Promise<CostCenter[]>;
  listBudgetPeriods(companyId: CompanyId): Promise<BudgetPeriod[]>;
  listBudgets(companyId: CompanyId): Promise<Budget[]>;
  listAllocationRules(companyId: CompanyId): Promise<AllocationRule[]>;
  listAssets(companyId: CompanyId): Promise<Asset[]>;
  listSuppliers(companyId: CompanyId): Promise<Supplier[]>;
  listPayables(companyId: CompanyId): Promise<PayableAccount[]>;
  listTransactions(companyId: CompanyId): Promise<FinancialTransaction[]>;
  listMinistries(companyId: CompanyId): Promise<Ministry[]>;
  listInvestments(companyId: CompanyId): Promise<Investment[]>;
  listChurchExpenses(companyId: CompanyId): Promise<ChurchOperationalExpense[]>;
  listBankStatementLines(companyId: CompanyId): Promise<BankStatementLine[]>;
  listAuditLogs(companyId: CompanyId): Promise<AuditLog[]>;
  getChurchReportSummary(
    companyId: CompanyId,
    periodId: string
  ): Promise<ChurchReportSummary | null>;
  listChurchReportMovements(
    companyId: CompanyId,
    periodId: string
  ): Promise<ChurchReportLine[]>;

  createFinancialTransaction(
    companyId: CompanyId,
    input: CreateFinancialTransactionInput
  ): Promise<FinancialTransaction>;
  createPayableAccount(
    companyId: CompanyId,
    input: CreatePayableAccountInput
  ): Promise<PayableAccount>;
  createChurchOperationalExpense(
    companyId: CompanyId,
    input: CreateChurchOperationalExpenseInput
  ): Promise<ChurchOperationalExpense>;
  createSupplier(
    companyId: CompanyId,
    input: CreateSupplierInput
  ): Promise<Supplier>;
  createCostCenter(
    companyId: CompanyId,
    input: CreateCostCenterInput
  ): Promise<CostCenter>;
  createBudget(
    companyId: CompanyId,
    input: CreateBudgetInput
  ): Promise<Budget>;
  createAsset(
    companyId: CompanyId,
    input: CreateAssetInput
  ): Promise<Asset>;
  createMinistry(
    companyId: CompanyId,
    input: CreateMinistryInput
  ): Promise<Ministry>;
  createInvestment(
    companyId: CompanyId,
    input: CreateInvestmentInput
  ): Promise<Investment>;
  createBankStatementLine(
    companyId: CompanyId,
    input: CreateBankStatementLineInput
  ): Promise<BankStatementLine>;
  createAllocationRule(
    companyId: CompanyId,
    input: CreateAllocationRuleInput
  ): Promise<AllocationRule>;
}
