import { validateAllocationPercentages } from '@/domain/allocationMath';
import type {
  CreateAllocationRuleInput,
  CreateAssetInput,
  CreateBankStatementLineInput,
  CreateBudgetInput,
  CreateChurchOperationalExpenseInput,
  CreateCostCenterInput,
  CreateFinancialTransactionInput,
  CreateInvestmentInput,
  CreateMinistryInput,
  CreatePayableAccountInput,
  CreateSupplierInput,
  FinancialPlatformRepository,
} from '@/services/repositories/financialPlatformRepository';
import {
  MOCK_ALLOCATION_RULES,
  MOCK_ASSETS,
  MOCK_AUDIT_LOGS,
  MOCK_BANK_LINES,
  MOCK_BUDGET_PERIODS,
  MOCK_BUDGETS,
  MOCK_CHURCH_EXPENSES,
  MOCK_COMPANIES,
  MOCK_COST_CENTERS,
  MOCK_INVESTMENTS,
  MOCK_MINISTRIES,
  MOCK_PAYABLES,
  MOCK_PROFILES_BY_EMAIL,
  MOCK_SUPPLIERS,
  MOCK_TRANSACTIONS,
} from '@/services/repositories/mock/mockSeedData';
import type {
  AllocationRule,
  Asset,
  AuditLog,
  BankStatementLine,
  Budget,
  ChurchOperationalExpense,
  ChurchReportLine,
  ChurchReportSummary,
  CompanyId,
  CostCenter,
  FinancialTransaction,
  Investment,
  Ministry,
  PayableAccount,
  Supplier,
} from '@/types/domain';

const MOCK_AUDIT_ACTOR_USER_ID = 'seed-admin';

function cloneMockState() {
  return {
    costCenters: MOCK_COST_CENTERS.map((row) => ({ ...row })),
    budgetPeriods: MOCK_BUDGET_PERIODS.map((row) => ({ ...row })),
    budgets: MOCK_BUDGETS.map((row) => ({ ...row })),
    allocationRules: MOCK_ALLOCATION_RULES.map((row) => ({
      ...row,
      splits: row.splits.map((s) => ({ ...s })),
    })),
    assets: MOCK_ASSETS.map((row) => ({ ...row })),
    suppliers: MOCK_SUPPLIERS.map((row) => ({ ...row })),
    payables: MOCK_PAYABLES.map((row) => ({ ...row })),
    transactions: MOCK_TRANSACTIONS.map((row) => ({ ...row })),
    ministries: MOCK_MINISTRIES.map((row) => ({
      ...row,
      memberUserIds: [...row.memberUserIds],
    })),
    investments: MOCK_INVESTMENTS.map((row) => ({ ...row })),
    churchExpenses: MOCK_CHURCH_EXPENSES.map((row) => ({ ...row })),
    bankLines: MOCK_BANK_LINES.map((row) => ({ ...row })),
    auditLogs: MOCK_AUDIT_LOGS.map((row) => ({ ...row })),
  };
}

type MockState = ReturnType<typeof cloneMockState>;

function newEntityId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function filterByCompany<T extends { companyId: CompanyId }>(
  rows: T[],
  companyId: CompanyId
): T[] {
  return rows.filter((row) => row.companyId === companyId);
}

function toDateOnly(isoOrDate: string): string {
  return isoOrDate.length >= 10 ? isoOrDate.slice(0, 10) : isoOrDate;
}

function isInBudgetRange(
  occurredAt: string,
  startDate: string,
  endDate: string
): boolean {
  const d = toDateOnly(occurredAt);
  return d >= startDate && d <= endDate;
}

function buildChurchReportLinesForRange(
  companyId: CompanyId,
  startDate: string,
  endDate: string,
  transactions: FinancialTransaction[],
  churchExpenses: ChurchOperationalExpense[]
): ChurchReportLine[] {
  const fromTx: ChurchReportLine[] = filterByCompany(transactions, companyId)
    .filter((t) => isInBudgetRange(t.occurredAt, startDate, endDate))
    .map((t) => ({
      id: t.id,
      source: 'financial_transaction',
      occurredAt: t.occurredAt,
      description: t.description,
      amount: t.amount,
      direction: t.direction,
      currencyCode: t.currencyCode,
      referenceKey: t.costCenterId,
    }));

  const fromChurch: ChurchReportLine[] = filterByCompany(
    churchExpenses,
    companyId
  )
    .filter((e) => isInBudgetRange(e.occurredAt, startDate, endDate))
    .map((e) => ({
      id: e.id,
      source: 'church_operational_expense',
      occurredAt: e.occurredAt,
      description: e.description,
      amount: e.amount,
      direction: 'expense' as const,
      currencyCode: e.currencyCode,
      referenceKey: e.expenseType,
    }));

  return [...fromTx, ...fromChurch].sort((a, b) => {
    const cmp = toDateOnly(a.occurredAt).localeCompare(toDateOnly(b.occurredAt));
    return cmp !== 0 ? cmp : a.id.localeCompare(b.id);
  });
}

function appendAudit(
  data: MockState,
  companyId: CompanyId,
  entityType: string,
  entityId: string,
  action: string
): void {
  const row: AuditLog = {
    id: newEntityId('aud'),
    companyId,
    actorUserId: MOCK_AUDIT_ACTOR_USER_ID,
    action,
    entityType,
    entityId,
    occurredAt: new Date().toISOString(),
    metadataJson: null,
  };
  data.auditLogs.push(row);
}

export function createMockFinancialPlatformRepository(): FinancialPlatformRepository {
  const data = cloneMockState();

  return {
    async getUserProfileForEmail(email: string) {
      const key = email.trim().toLowerCase();
      return MOCK_PROFILES_BY_EMAIL[key] ?? null;
    },

    async listCompanies() {
      return [...MOCK_COMPANIES];
    },

    async listCostCenters(companyId: CompanyId) {
      return filterByCompany(data.costCenters, companyId);
    },

    async listBudgetPeriods(companyId: CompanyId) {
      return filterByCompany(data.budgetPeriods, companyId);
    },

    async listBudgets(companyId: CompanyId) {
      return filterByCompany(data.budgets, companyId);
    },

    async listAllocationRules(companyId: CompanyId) {
      return filterByCompany(data.allocationRules, companyId);
    },

    async listAssets(companyId: CompanyId) {
      return filterByCompany(data.assets, companyId);
    },

    async listSuppliers(companyId: CompanyId) {
      return filterByCompany(data.suppliers, companyId);
    },

    async listPayables(companyId: CompanyId) {
      return filterByCompany(data.payables, companyId);
    },

    async listTransactions(companyId: CompanyId) {
      return filterByCompany(data.transactions, companyId);
    },

    async listMinistries(companyId: CompanyId) {
      return filterByCompany(data.ministries, companyId);
    },

    async listInvestments(companyId: CompanyId) {
      return filterByCompany(data.investments, companyId);
    },

    async listChurchExpenses(companyId: CompanyId) {
      return filterByCompany(data.churchExpenses, companyId);
    },

    async listBankStatementLines(companyId: CompanyId) {
      return filterByCompany(data.bankLines, companyId);
    },

    async listAuditLogs(companyId: CompanyId) {
      return filterByCompany(data.auditLogs, companyId);
    },

    async getChurchReportSummary(companyId: CompanyId, periodId: string) {
      const period = data.budgetPeriods.find(
        (p) => p.id === periodId && p.companyId === companyId
      );
      if (!period) {
        return null;
      }

      const lines = buildChurchReportLinesForRange(
        companyId,
        period.startDate,
        period.endDate,
        data.transactions,
        data.churchExpenses
      );
      const income = lines
        .filter((l) => l.direction === 'income')
        .reduce((s, l) => s + l.amount, 0);
      const expense = lines
        .filter((l) => l.direction === 'expense')
        .reduce((s, l) => s + l.amount, 0);

      const summary: ChurchReportSummary = {
        companyId,
        periodId,
        totalIncome: income,
        totalExpense: expense,
        currencyCode: lines[0]?.currencyCode ?? 'BRL',
      };
      return summary;
    },

    async listChurchReportMovements(companyId: CompanyId, periodId: string) {
      const period = data.budgetPeriods.find(
        (p) => p.id === periodId && p.companyId === companyId
      );
      if (!period) {
        return [];
      }
      return buildChurchReportLinesForRange(
        companyId,
        period.startDate,
        period.endDate,
        data.transactions,
        data.churchExpenses
      );
    },

    async createFinancialTransaction(
      companyId: CompanyId,
      input: CreateFinancialTransactionInput
    ) {
      const row: FinancialTransaction = {
        id: newEntityId('tx'),
        companyId,
        description: input.description,
        amount: input.amount,
        currencyCode: input.currencyCode,
        direction: input.direction,
        occurredAt: input.occurredAt,
        costCenterId: input.costCenterId,
        categoryId: input.categoryId,
      };
      data.transactions.push(row);
      appendAudit(
        data,
        companyId,
        'financial_transaction',
        row.id,
        'financial_transaction.created'
      );
      return row;
    },

    async createPayableAccount(
      companyId: CompanyId,
      input: CreatePayableAccountInput
    ) {
      const row: PayableAccount = {
        id: newEntityId('ap'),
        companyId,
        supplierId: input.supplierId,
        amount: input.amount,
        currencyCode: input.currencyCode,
        dueDate: input.dueDate,
        status: input.status ?? 'draft',
      };
      data.payables.push(row);
      appendAudit(
        data,
        companyId,
        'payable_account',
        row.id,
        'payable.created'
      );
      return row;
    },

    async createChurchOperationalExpense(
      companyId: CompanyId,
      input: CreateChurchOperationalExpenseInput
    ) {
      const row: ChurchOperationalExpense = {
        id: newEntityId('che'),
        companyId,
        description: input.description,
        amount: input.amount,
        currencyCode: input.currencyCode,
        expenseType: input.expenseType,
        occurredAt: input.occurredAt,
        categoryId: input.categoryId,
      };
      data.churchExpenses.push(row);
      appendAudit(
        data,
        companyId,
        'church_operational_expense',
        row.id,
        'church_expense.created'
      );
      return row;
    },

    async createSupplier(companyId: CompanyId, input: CreateSupplierInput) {
      const row: Supplier = {
        id: newEntityId('sup'),
        companyId,
        name: input.name,
        taxId: input.taxId,
      };
      data.suppliers.push(row);
      appendAudit(data, companyId, 'supplier', row.id, 'supplier.created');
      return row;
    },

    async createCostCenter(companyId: CompanyId, input: CreateCostCenterInput) {
      const row: CostCenter = {
        id: newEntityId('cc'),
        companyId,
        name: input.name,
        ownerUserId: input.ownerUserId,
      };
      data.costCenters.push(row);
      appendAudit(data, companyId, 'cost_center', row.id, 'cost_center.created');
      return row;
    },

    async createBudget(companyId: CompanyId, input: CreateBudgetInput) {
      const duplicate = data.budgets.some(
        (b) =>
          b.companyId === companyId &&
          b.costCenterId === input.costCenterId &&
          b.periodId === input.periodId
      );
      if (duplicate) {
        throw new Error(
          'Já existe um orçamento para este centro de custo e período.'
        );
      }
      const row: Budget = {
        id: newEntityId('bud'),
        companyId,
        costCenterId: input.costCenterId,
        periodId: input.periodId,
        plannedAmount: input.plannedAmount,
        actualAmount: 0,
        currencyCode: input.currencyCode,
        version: 1,
      };
      data.budgets.push(row);
      appendAudit(data, companyId, 'budget', row.id, 'budget.created');
      return row;
    },

    async createAsset(companyId: CompanyId, input: CreateAssetInput) {
      const row: Asset = {
        id: newEntityId('asset'),
        companyId,
        name: input.name,
        category: input.category,
        ownerUserId: input.ownerUserId,
        acquisitionDate: input.acquisitionDate,
        acquisitionValue: input.acquisitionValue,
        currencyCode: input.currencyCode,
        status: input.status,
      };
      data.assets.push(row);
      appendAudit(data, companyId, 'asset', row.id, 'asset.created');
      return row;
    },

    async createMinistry(companyId: CompanyId, input: CreateMinistryInput) {
      const row: Ministry = {
        id: newEntityId('min'),
        companyId,
        name: input.name,
        leaderUserId: input.leaderUserId,
        memberUserIds: [],
        linkedCostCenterId: input.linkedCostCenterId,
      };
      data.ministries.push(row);
      appendAudit(data, companyId, 'ministry', row.id, 'ministry.created');
      return row;
    },

    async createInvestment(companyId: CompanyId, input: CreateInvestmentInput) {
      const row: Investment = {
        id: newEntityId('inv'),
        companyId,
        name: input.name,
        instrumentType: input.instrumentType,
        openedAt: input.openedAt,
        principalAmount: input.principalAmount,
        currencyCode: input.currencyCode,
      };
      data.investments.push(row);
      appendAudit(data, companyId, 'investment', row.id, 'investment.created');
      return row;
    },

    async createBankStatementLine(
      companyId: CompanyId,
      input: CreateBankStatementLineInput
    ) {
      const row: BankStatementLine = {
        id: newEntityId('bsl'),
        companyId,
        importBatchId: 'manual-entry',
        bookedAt: input.bookedAt,
        amount: input.amount,
        currencyCode: input.currencyCode,
        description: input.description,
        matchedTransactionId: null,
        status: 'open',
      };
      data.bankLines.push(row);
      appendAudit(
        data,
        companyId,
        'bank_statement_line',
        row.id,
        'bank_line.created'
      );
      return row;
    },

    async createAllocationRule(
      companyId: CompanyId,
      input: CreateAllocationRuleInput
    ) {
      const validation = validateAllocationPercentages(input.splits);
      if (!validation.ok) {
        throw new Error(validation.reason);
      }
      const row: AllocationRule = {
        id: newEntityId('alloc'),
        companyId,
        name: input.name,
        traceabilityCode: input.traceabilityCode,
        splits: input.splits.map((s) => ({ ...s })),
      };
      data.allocationRules.push(row);
      appendAudit(
        data,
        companyId,
        'allocation_rule',
        row.id,
        'allocation_rule.created'
      );
      return row;
    },
  };
}
