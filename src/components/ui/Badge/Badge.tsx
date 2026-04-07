import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import styles from '@/components/ui/Badge/Badge.module.css';

export type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return <span className={cn(styles.root, className)}>{children}</span>;
}
