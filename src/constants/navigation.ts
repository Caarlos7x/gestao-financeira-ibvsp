import { ROUTES } from '@/constants/routes';

export type NavItem = {
  label: string;
  to: string;
};

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { label: 'Painel', to: ROUTES.root },
  { label: 'Lançamentos', to: ROUTES.entries },
  { label: 'Empresas', to: ROUTES.companies },
  { label: 'Centros de custo', to: ROUTES.costCenters },
  { label: 'Orçamentos', to: ROUTES.budgets },
  { label: 'Rateios', to: ROUTES.allocations },
  { label: 'Ativos', to: ROUTES.assets },
  { label: 'Contas a pagar', to: ROUTES.accountsPayable },
  { label: 'Fornecedores', to: ROUTES.suppliers },
  { label: 'Conciliação bancária', to: ROUTES.bankReconciliation },
  { label: 'Relatório geral (igreja)', to: ROUTES.churchGeneralReport },
  { label: 'Ministérios', to: ROUTES.ministries },
  { label: 'Gestão da igreja (despesas)', to: ROUTES.churchFinancial },
  { label: 'Investimentos', to: ROUTES.investments },
  { label: 'Auditoria', to: ROUTES.audit },
  { label: 'Configurações', to: ROUTES.settings },
];
