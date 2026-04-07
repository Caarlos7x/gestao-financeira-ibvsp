import type { Permission } from '@/domain/permissions';
import type {
  AssetStatus,
  ChurchOperationalExpense,
  PayableAccountStatus,
  ReconciliationLineStatus,
  UserRole,
} from '@/types/domain';

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador',
  finance_manager: 'Gestor financeiro',
  analyst: 'Analista',
  approver: 'Aprovador',
  viewer: 'Somente leitura',
};

export function formatUserRolePt(role: UserRole): string {
  return ROLE_LABELS[role];
}

const PAYABLE_STATUS_LABELS: Record<PayableAccountStatus, string> = {
  draft: 'Rascunho',
  pending_approval: 'Aguardando aprovação',
  approved: 'Aprovado',
  scheduled: 'Agendado',
  paid: 'Pago',
  cancelled: 'Cancelado',
};

export function formatPayableStatusPt(status: PayableAccountStatus): string {
  return PAYABLE_STATUS_LABELS[status];
}

const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  active: 'Ativo',
  disposed: 'Baixado',
  maintenance: 'Manutenção',
  retired: 'Aposentado',
};

export function formatAssetStatusPt(status: AssetStatus): string {
  return ASSET_STATUS_LABELS[status];
}

const BANK_LINE_STATUS_LABELS: Record<ReconciliationLineStatus, string> = {
  open: 'Em aberto',
  matched: 'Conciliado',
  exception: 'Exceção',
};

export function formatBankLineStatusPt(status: ReconciliationLineStatus): string {
  return BANK_LINE_STATUS_LABELS[status];
}

const EXPENSE_TYPE_LABELS: Record<ChurchOperationalExpense['expenseType'], string> = {
  maintenance: 'Manutenção',
  events: 'Eventos',
  operations: 'Operações',
  other: 'Outros',
};

export function formatChurchExpenseTypePt(
  type: ChurchOperationalExpense['expenseType']
): string {
  return EXPENSE_TYPE_LABELS[type];
}

const PERMISSION_LABELS: Record<Permission, string> = {
  'platform:admin': 'Administração da plataforma',
  'companies:read': 'Empresas: leitura',
  'companies:write': 'Empresas: escrita',
  'cost_centers:write': 'Centros de custo: escrita',
  'budgets:read': 'Orçamentos: leitura',
  'budgets:write': 'Orçamentos: escrita',
  'payables:read': 'Contas a pagar: leitura',
  'payables:write': 'Contas a pagar: escrita',
  'payables:approve': 'Contas a pagar: aprovação',
  'reports:read': 'Relatórios: leitura',
  'audit:read': 'Auditoria: leitura',
  'settings:write': 'Configurações: escrita',
};

export function formatPermissionPt(permission: Permission): string {
  return PERMISSION_LABELS[permission];
}

const INSTRUMENT_LABELS: Record<string, string> = {
  money_market: 'Mercado monetário',
  mercado_monetario: 'Mercado monetário',
  fixed_income: 'Renda fixa',
};

export function formatInvestmentInstrumentPt(instrumentType: string): string {
  return INSTRUMENT_LABELS[instrumentType] ?? instrumentType;
}
