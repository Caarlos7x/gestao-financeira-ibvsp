import { AppShell } from '@/features/app-shell';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { ROUTES } from '@/constants/routes';
import { LoginPage } from '@/features/authentication/pages/LoginPage';
import { AccountsPayablePage } from '@/features/accounts-payable/pages/AccountsPayablePage';
import { AllocationsPage } from '@/features/allocations/pages/AllocationsPage';
import { AssetsPage } from '@/features/assets/pages/AssetsPage';
import { AuditLogPage } from '@/features/audit/pages/AuditLogPage';
import { BankReconciliationPage } from '@/features/bank-reconciliation/pages/BankReconciliationPage';
import { BudgetsPage } from '@/features/budgets/pages/BudgetsPage';
import { ChurchFinancialPage } from '@/features/church-financial/pages/ChurchFinancialPage';
import { CompaniesPage } from '@/features/companies/pages/CompaniesPage';
import { CostCentersPage } from '@/features/cost-centers/pages/CostCentersPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { LancamentosPage } from '@/features/entries/pages/LancamentosPage';
import { InvestmentsPage } from '@/features/investments/pages/InvestmentsPage';
import { MinistriesPage } from '@/features/ministries/pages/MinistriesPage';
import { ChurchGeneralReportPage } from '@/features/reports/pages/ChurchGeneralReportPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { SuppliersPage } from '@/features/suppliers/pages/SuppliersPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path={ROUTES.root} element={<DashboardPage />} />
            <Route path={ROUTES.entries} element={<LancamentosPage />} />
            <Route path={ROUTES.companies} element={<CompaniesPage />} />
            <Route path={ROUTES.costCenters} element={<CostCentersPage />} />
            <Route path={ROUTES.budgets} element={<BudgetsPage />} />
            <Route path={ROUTES.allocations} element={<AllocationsPage />} />
            <Route path={ROUTES.assets} element={<AssetsPage />} />
            <Route path={ROUTES.accountsPayable} element={<AccountsPayablePage />} />
            <Route path={ROUTES.suppliers} element={<SuppliersPage />} />
            <Route
              path={ROUTES.bankReconciliation}
              element={<BankReconciliationPage />}
            />
            <Route
              path={ROUTES.churchGeneralReport}
              element={<ChurchGeneralReportPage />}
            />
            <Route path={ROUTES.ministries} element={<MinistriesPage />} />
            <Route
              path={ROUTES.churchFinancial}
              element={<ChurchFinancialPage />}
            />
            <Route path={ROUTES.investments} element={<InvestmentsPage />} />
            <Route path={ROUTES.audit} element={<AuditLogPage />} />
            <Route path={ROUTES.settings} element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
