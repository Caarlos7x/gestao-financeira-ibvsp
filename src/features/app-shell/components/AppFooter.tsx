import { useCurrentYear } from '@/features/app-shell/hooks/useCurrentYear';
import styles from '@/features/app-shell/components/AppFooter.module.css';

const DEV_LAB_URL = 'https://www.devside.com.br/';

export function AppFooter() {
  const year = useCurrentYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.copy}>
          © {year} Plataforma de Gestão Financeira — Desenvolvido por{' '}
          <a
            className={styles.link}
            href={DEV_LAB_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Dev Lab
          </a>
        </p>
      </div>
    </footer>
  );
}
