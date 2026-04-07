import { ROUTES } from '@/constants/routes';
import {
  HiArrowTrendingUp,
  HiBuildingLibrary,
  HiBuildingOffice2,
  HiBuildingStorefront,
  HiChartPie,
  HiClipboardDocumentList,
  HiCog6Tooth,
  HiCreditCard,
  HiCube,
  HiDocumentText,
  HiHome,
  HiQuestionMarkCircle,
  HiShieldCheck,
  HiSquare3Stack3D,
  HiTruck,
  HiUserGroup,
  HiWallet,
} from 'react-icons/hi2';

const NAV_ICON_SIZE = 20;

type SidebarNavIconProps = {
  to: string;
  className?: string;
};

export function SidebarNavIcon({ to, className }: SidebarNavIconProps) {
  const common = {
    className,
    size: NAV_ICON_SIZE,
    'aria-hidden': true as const,
  };

  switch (to) {
    case ROUTES.root:
      return <HiHome {...common} />;
    case ROUTES.entries:
      return <HiClipboardDocumentList {...common} />;
    case ROUTES.companies:
      return <HiBuildingOffice2 {...common} />;
    case ROUTES.costCenters:
      return <HiSquare3Stack3D {...common} />;
    case ROUTES.budgets:
      return <HiWallet {...common} />;
    case ROUTES.allocations:
      return <HiChartPie {...common} />;
    case ROUTES.assets:
      return <HiCube {...common} />;
    case ROUTES.accountsPayable:
      return <HiCreditCard {...common} />;
    case ROUTES.suppliers:
      return <HiTruck {...common} />;
    case ROUTES.bankReconciliation:
      return <HiBuildingLibrary {...common} />;
    case ROUTES.churchGeneralReport:
      return <HiDocumentText {...common} />;
    case ROUTES.ministries:
      return <HiUserGroup {...common} />;
    case ROUTES.churchFinancial:
      return <HiBuildingStorefront {...common} />;
    case ROUTES.investments:
      return <HiArrowTrendingUp {...common} />;
    case ROUTES.audit:
      return <HiShieldCheck {...common} />;
    case ROUTES.settings:
      return <HiCog6Tooth {...common} />;
    default:
      return <HiQuestionMarkCircle {...common} />;
  }
}
