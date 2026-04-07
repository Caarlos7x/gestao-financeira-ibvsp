import { Text } from '@/components/ui/Text';
import { cn } from '@/utils/cn';
import styles from '@/components/ui/PageHeader/PageHeader.module.css';

export type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <header className={cn(styles.root, className)}>
      <Text variant="h1">{title}</Text>
      {description ? (
        <Text variant="lead" className={styles.lead}>
          {description}
        </Text>
      ) : null}
    </header>
  );
}
