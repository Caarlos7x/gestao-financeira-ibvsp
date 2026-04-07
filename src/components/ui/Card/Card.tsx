import type { ReactNode } from 'react';
import { Text } from '@/components/ui/Text';
import { cn } from '@/utils/cn';
import styles from '@/components/ui/Card/Card.module.css';

export type CardProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  /** Slot for badge / actions in header row */
  headerExtra?: ReactNode;
  padded?: boolean;
  /** Dashboard-style metric card (title + big value area) */
  variant?: 'default' | 'metric';
};

export function Card({
  children,
  className,
  title,
  headerExtra,
  padded = true,
  variant = 'default',
}: CardProps) {
  const showHeader = title != null || headerExtra != null;

  if (variant === 'metric' && title) {
    return (
      <div className={cn(styles.root, padded && styles.padded, className)}>
        <p className={styles.metricTitle}>{title}</p>
        <div className={styles.body}>{children}</div>
      </div>
    );
  }

  return (
    <div className={cn(styles.root, padded && styles.padded, className)}>
      {showHeader ? (
        <div
          className={cn(
            styles.header,
            title == null && headerExtra != null && styles.headerOnlyExtra
          )}
        >
          {title ? (
            <Text variant="h3" as="h2">
              {title}
            </Text>
          ) : null}
          {headerExtra}
        </div>
      ) : null}
      <div
        className={cn(styles.body, !showHeader && styles.bodyNoHeader)}
      >
        {children}
      </div>
    </div>
  );
}
