import { AppFooter } from '@/features/app-shell/components/AppFooter';
import { AppHeader } from '@/features/app-shell/components/AppHeader';
import { AppSidebar } from '@/features/app-shell/components/AppSidebar';
import { Outlet } from 'react-router-dom';
import styles from '@/features/app-shell/components/AppShell.module.css';

export function AppShell() {
  return (
    <div className={styles.shell}>
      <div className={styles.body}>
        <AppSidebar />
        <div className={styles.mainColumn}>
          <AppHeader />
          <main className={styles.main}>
            <Outlet />
          </main>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
