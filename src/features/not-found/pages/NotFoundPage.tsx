import { Button } from '@/components/ui/buttons';
import { UI_MESSAGES_PT_BR } from '@/constants/uiMessagesPtBR';
import { ROUTES } from '@/constants/routes';
import styles from '@/features/not-found/pages/NotFoundPage.module.css';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="page" aria-labelledby="not-found-title">
      <div className={styles.wrap}>
        <p className={styles.code} aria-hidden>
          {UI_MESSAGES_PT_BR.notFoundCode}
        </p>
        <h1 id="not-found-title" className={styles.title}>
          {UI_MESSAGES_PT_BR.notFoundTitle}
        </h1>
        <p className={styles.lead}>{UI_MESSAGES_PT_BR.notFoundDescription}</p>
        <div className={styles.actions}>
          <Button
            type="button"
            variant="primary"
            onClick={() => navigate(ROUTES.root, { replace: true })}
          >
            {UI_MESSAGES_PT_BR.notFoundBackHome}
          </Button>
        </div>
      </div>
    </section>
  );
}
