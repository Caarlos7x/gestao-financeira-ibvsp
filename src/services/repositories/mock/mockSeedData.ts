import type {
  AllocationRule,
  AppUserProfile,
  Asset,
  AuditLog,
  BankStatementLine,
  Budget,
  BudgetPeriod,
  ChurchOperationalExpense,
  Company,
  CostCenter,
  FinancialTransaction,
  Investment,
  Ministry,
  PayableAccount,
  Supplier,
} from '@/types/domain';

export const MOCK_COMPANIES: Company[] = [
  {
    id: '11111111-1111-4111-8111-111111111101',
    name: 'Igreja Batista - Vila São Pedro',
    createdAt: '2024-01-10T12:00:00.000Z',
  },
];

export const MOCK_PROFILES_BY_EMAIL: Record<string, AppUserProfile> = {
  'admin@sistema.test': {
    userId: 'seed-admin',
    email: 'admin@sistema.test',
    displayName: 'Ana Carvalho',
    firstName: 'Ana',
    lastName: 'Carvalho',
    role: 'admin',
    companyIds: [MOCK_COMPANIES[0]!.id],
  },
  'operador@sistema.test': {
    userId: 'seed-operador',
    email: 'operador@sistema.test',
    displayName: 'Bruno Oliveira',
    firstName: 'Bruno',
    lastName: 'Oliveira',
    role: 'finance_manager',
    companyIds: [MOCK_COMPANIES[0]!.id],
  },
};

export const MOCK_COST_CENTERS: CostCenter[] = [
  {
    id: 'cc-acme-ops',
    companyId: MOCK_COMPANIES[0]!.id,
    name: 'Operações',
    ownerUserId: 'seed-admin',
  },
  {
    id: 'cc-acme-fin',
    companyId: MOCK_COMPANIES[0]!.id,
    name: 'Financeiro',
    ownerUserId: null,
  },
];

export const MOCK_BUDGET_PERIODS: BudgetPeriod[] = [
  {
    id: 'bp-2025-q1',
    companyId: MOCK_COMPANIES[0]!.id,
    startDate: '2025-01-01',
    endDate: '2025-03-31',
  },
  {
    id: 'bp-2025-q2',
    companyId: MOCK_COMPANIES[0]!.id,
    startDate: '2025-04-01',
    endDate: '2025-06-30',
  },
];

export const MOCK_BUDGETS: Budget[] = [
  {
    id: 'bud-1',
    companyId: MOCK_COMPANIES[0]!.id,
    costCenterId: 'cc-acme-ops',
    periodId: 'bp-2025-q1',
    plannedAmount: 100_000,
    actualAmount: 92_500,
    currencyCode: 'BRL',
    version: 1,
  },
];

export const MOCK_ALLOCATION_RULES: AllocationRule[] = [
  {
    id: 'alloc-1',
    companyId: MOCK_COMPANIES[0]!.id,
    name: 'Rateio de custos indiretos',
    traceabilityCode: 'RULE-OVH-001',
    splits: [
      { costCenterId: 'cc-acme-ops', percentage: 60 },
      { costCenterId: 'cc-acme-fin', percentage: 40 },
    ],
  },
];

export const MOCK_ASSETS: Asset[] = [
  {
    id: 'asset-1',
    companyId: MOCK_COMPANIES[0]!.id,
    name: 'Veículo de entregas',
    category: 'veiculo',
    ownerUserId: 'seed-admin',
    acquisitionDate: '2023-06-01',
    acquisitionValue: 85_000,
    currencyCode: 'BRL',
    status: 'active',
  },
];

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    companyId: MOCK_COMPANIES[0]!.id,
    name: 'Fornecedor de materiais',
    taxId: '12.345.678/0001-90',
  },
];

export const MOCK_PAYABLES: PayableAccount[] = [
  {
    id: 'ap-1',
    companyId: MOCK_COMPANIES[0]!.id,
    supplierId: 'sup-1',
    amount: 4_200,
    currencyCode: 'BRL',
    dueDate: '2025-04-15',
    status: 'pending_approval',
  },
];

export const MOCK_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'tx-1',
    companyId: MOCK_COMPANIES[0]!.id,
    costCenterId: 'cc-acme-ops',
    categoryId: null,
    amount: 1_250.5,
    currencyCode: 'BRL',
    direction: 'expense',
    occurredAt: '2025-03-12T10:00:00.000Z',
    description: 'Utilidades (energia)',
  },
  {
    id: 'tx-2',
    companyId: MOCK_COMPANIES[0]!.id,
    costCenterId: null,
    categoryId: null,
    amount: 15_000,
    currencyCode: 'BRL',
    direction: 'income',
    occurredAt: '2025-02-10T12:00:00.000Z',
    description: 'Dízimos e ofertas — fevereiro',
  },
  {
    id: 'tx-3',
    companyId: MOCK_COMPANIES[0]!.id,
    costCenterId: 'cc-acme-fin',
    categoryId: null,
    amount: 3_200,
    currencyCode: 'BRL',
    direction: 'income',
    occurredAt: '2025-04-08T09:00:00.000Z',
    description: 'Evento beneficente — arrecadação',
  },
];

export const MOCK_MINISTRIES: Ministry[] = [
  {
    id: 'min-1',
    companyId: MOCK_COMPANIES[0]!.id,
    name: 'Ação social',
    leaderUserId: 'seed-admin',
    memberUserIds: [],
    linkedCostCenterId: 'cc-acme-ops',
  },
];

export const MOCK_INVESTMENTS: Investment[] = [
  {
    id: 'inv-1',
    companyId: MOCK_COMPANIES[0]!.id,
    name: 'Fundo reserva',
    instrumentType: 'mercado_monetario',
    openedAt: '2024-11-01',
    principalAmount: 50_000,
    currencyCode: 'BRL',
  },
];

export const MOCK_CHURCH_EXPENSES: ChurchOperationalExpense[] = [
  {
    id: 'che-1',
    companyId: MOCK_COMPANIES[0]!.id,
    categoryId: null,
    amount: 980,
    currencyCode: 'BRL',
    expenseType: 'maintenance',
    occurredAt: '2025-03-05',
    description: 'Manutenção do templo',
  },
  {
    id: 'che-2',
    companyId: MOCK_COMPANIES[0]!.id,
    categoryId: null,
    amount: 450,
    currencyCode: 'BRL',
    expenseType: 'events',
    occurredAt: '2025-04-20',
    description: 'Materiais para culto especial',
  },
];

export const MOCK_BANK_LINES: BankStatementLine[] = [
  {
    id: 'bsl-1',
    companyId: MOCK_COMPANIES[0]!.id,
    importBatchId: 'imp-1',
    bookedAt: '2025-03-10',
    amount: -1_250.5,
    currencyCode: 'BRL',
    description: 'PAGAMENTO ENERGIA',
    matchedTransactionId: 'tx-1',
    status: 'matched',
  },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    companyId: MOCK_COMPANIES[0]!.id,
    actorUserId: 'seed-admin',
    action: 'payable.created',
    entityType: 'payable_account',
    entityId: 'ap-1',
    occurredAt: '2025-03-20T15:00:00.000Z',
    metadataJson: null,
  },
];
