import { PRIMARY_NAV_ITEMS } from '@/constants/navigation';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { ROUTES } from '@/constants/routes';
import { useCompanyContext } from '@/context/CompanyContext';
import { cn } from '@/utils/cn';
import { useCallback, useEffect, useState } from 'react';
import { HiBars3, HiChevronRight, HiXMark } from 'react-icons/hi2';
import { NavLink } from 'react-router-dom';
import { SidebarNavIcon } from '@/features/app-shell/components/sidebarNavIcons';
import styles from '@/features/app-shell/components/AppSidebar.module.css';

const SIDEBAR_COLLAPSED_STORAGE_KEY = 'financial-platform.sidebar.collapsed';

export function AppSidebar() {
  const { allowedCompanies, selectedCompanyId } = useCompanyContext();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === '1') {
        setCollapsed(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((previous) => {
      const next = !previous;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const selectedCompany = allowedCompanies.find(
    (c) => c.id === selectedCompanyId
  );
  const brandSubtitle =
    selectedCompany?.name ??
    (allowedCompanies.length === 0
      ? UI_MESSAGES_PT_BR.noCompaniesOption
      : UI_MESSAGES_PT_BR.sidebarBrandFallback);

  return (
    <aside
      className={cn(styles.aside, collapsed && styles.asideCollapsed)}
      data-collapsed={collapsed ? 'true' : 'false'}
    >
      <div className={styles.brandRow}>
        <div className={styles.brandLeft}>
          <div className={styles.logoMark}>
            <img
              className={styles.logoImg}
              src="/ibvsp-logo.png"
              alt={UI_MESSAGES_PT_BR.brandLogoAlt}
              width={140}
              height={56}
              decoding="async"
            />
          </div>
          <div
            className={cn(styles.brandText, collapsed && styles.brandTextHiddenWhenCollapsed)}
          >
            <span className={styles.brandTitle}>
              {UI_MESSAGES_PT_BR.appProductTitle}
            </span>
            <span className={styles.brandSubtitle}>{brandSubtitle}</span>
          </div>
        </div>
        <button
          type="button"
          className={styles.panelToggle}
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          aria-controls="sidebar-primary-nav"
          aria-label={
            collapsed
              ? UI_MESSAGES_PT_BR.sidebarExpand
              : UI_MESSAGES_PT_BR.sidebarCollapse
          }
          title={
            collapsed
              ? UI_MESSAGES_PT_BR.sidebarExpand
              : UI_MESSAGES_PT_BR.sidebarCollapse
          }
        >
          {collapsed ? (
            <HiBars3 className={styles.panelToggleIcon} />
          ) : (
            <HiXMark className={styles.panelToggleIcon} />
          )}
        </button>
      </div>

      <nav
        id="sidebar-primary-nav"
        className={styles.nav}
        aria-label="Principal"
      >
        {PRIMARY_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(styles.link, isActive && styles.linkActive)
            }
            end={item.to === ROUTES.root}
            title={collapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <span className={styles.linkInner}>
                <span className={styles.iconWrap}>
                  <SidebarNavIcon to={item.to} className={styles.icon} />
                </span>
                <span className={styles.label}>{item.label}</span>
                {isActive && !collapsed ? (
                  <HiChevronRight
                    className={styles.chevron}
                    aria-hidden
                    size={18}
                  />
                ) : null}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
