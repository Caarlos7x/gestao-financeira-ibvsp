import { MOBILE_NAV_MEDIA_QUERY } from '@/constants/layout';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { AppFooter } from '@/features/app-shell/components/AppFooter';
import { AppHeader } from '@/features/app-shell/components/AppHeader';
import { AppSidebar } from '@/features/app-shell/components/AppSidebar';
import { useMatchMedia } from '@/hooks/useMatchMedia';
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import styles from '@/features/app-shell/components/AppShell.module.css';

export function AppShell() {
  const { pathname } = useLocation();
  const isMobileNav = useMatchMedia(MOBILE_NAV_MEDIA_QUERY);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileNav) {
      setMobileNavOpen(false);
    }
  }, [isMobileNav]);

  useEffect(() => {
    if (!isMobileNav || !mobileNavOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileNav, mobileNavOpen]);

  useEffect(() => {
    if (!isMobileNav || !mobileNavOpen) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobileNav, mobileNavOpen]);

  return (
    <div className={styles.shell}>
      {isMobileNav && mobileNavOpen ? (
        <button
          type="button"
          className={styles.backdrop}
          aria-label={UI_MESSAGES_PT_BR.navCloseMenu}
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}
      <div className={styles.body}>
        <AppSidebar
          isMobileLayout={isMobileNav}
          mobileDrawerOpen={mobileNavOpen}
          onMobileDrawerClose={() => setMobileNavOpen(false)}
        />
        <div className={styles.mainColumn}>
          <AppHeader
            mobileNavOpen={mobileNavOpen}
            onOpenMobileNav={
              isMobileNav ? () => setMobileNavOpen(true) : undefined
            }
          />
          <main className={styles.main}>
            <Outlet />
          </main>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
