import { isTemporaryDirectAccess } from '@/config/authBypass';
import { matchesProtectedAppRoute } from '@/constants/matchesAppRoute';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { useAuthContext } from '@/context/AuthContext';
import { useCompanyContext } from '@/context/CompanyContext';
import { Button } from '@/components/ui/buttons';
import { IconButton } from '@/components/ui/IconButton';
import { useCurrentNavItem } from '@/features/app-shell/hooks/useCurrentNavItem';
import { formatHeaderPersonName } from '@/features/app-shell/utils/formatHeaderPersonName';
import { getUserInitials } from '@/features/app-shell/utils/getUserInitials';
import { formatUserRolePt } from '@/utils/domainLabelsPtBR';
import styles from '@/features/app-shell/components/AppHeader.module.css';
import { HiBars3 } from 'react-icons/hi2';
import { useLocation } from 'react-router-dom';

export type AppHeaderProps = {
  /** Quando definido, exibe o botão do menu (layout estreito). */
  onOpenMobileNav?: () => void;
  mobileNavOpen?: boolean;
};

export function AppHeader({
  onOpenMobileNav,
  mobileNavOpen = false,
}: AppHeaderProps) {
  const { pathname } = useLocation();
  const { state, signOut } = useAuthContext();
  const { allowedCompanies, selectedCompanyId } = useCompanyContext();
  const navItem = useCurrentNavItem();

  const profile =
    state.status === 'signed_in' ? state.profile : null;

  const selectedCompany = allowedCompanies.find(
    (company) => company.id === selectedCompanyId
  );

  const pageTitle = matchesProtectedAppRoute(pathname)
    ? (navItem?.label ?? UI_MESSAGES_PT_BR.headerPageFallbackTitle)
    : UI_MESSAGES_PT_BR.notFoundTitle;
  const pageSubtitle = selectedCompany?.name
    ? selectedCompany.name
    : UI_MESSAGES_PT_BR.headerDefaultSubtitle;

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <div className={styles.titleBlock}>
          {onOpenMobileNav ? (
            <IconButton
              type="button"
              size="md"
              className={styles.menuButton}
              aria-label={UI_MESSAGES_PT_BR.navOpenMenu}
              aria-expanded={mobileNavOpen}
              aria-controls="sidebar-primary-nav"
              onClick={() => onOpenMobileNav()}
            >
              <HiBars3 aria-hidden />
            </IconButton>
          ) : null}
          <div className={styles.pageIntro}>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
            <p className={styles.pageSubtitle}>{pageSubtitle}</p>
          </div>
        </div>
        {profile ? (
          <div className={styles.userArea}>
            <div className={styles.userTexts}>
              <span className={styles.userName}>
                {formatHeaderPersonName(profile)}
              </span>
              <span className={styles.userRole}>
                {formatUserRolePt(profile.role)}
              </span>
            </div>
            <div className={styles.avatar} aria-hidden>
              {getUserInitials(profile)}
            </div>
            {!isTemporaryDirectAccess() ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => signOut()}
              >
                {UI_MESSAGES_PT_BR.signOut}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
