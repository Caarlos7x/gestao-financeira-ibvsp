import type { ElementType, ReactNode } from 'react';
import { cn } from '@/utils/cn';
import styles from '@/components/ui/Text/Text.module.css';

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'lead'
  | 'body'
  | 'muted'
  | 'caption'
  | 'label'
  | 'brand'
  | 'mono';

const defaultElement: Record<TextVariant, ElementType> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  lead: 'p',
  body: 'p',
  muted: 'p',
  caption: 'span',
  label: 'span',
  brand: 'span',
  mono: 'span',
};

const variantClass: Record<TextVariant, string> = {
  display: styles.display,
  h1: styles.h1,
  h2: styles.h2,
  h3: styles.h3,
  lead: styles.lead,
  body: styles.body,
  muted: styles.muted,
  caption: styles.caption,
  label: styles.label,
  brand: styles.brand,
  mono: styles.mono,
};

export type TextProps = {
  as?: ElementType;
  variant: TextVariant;
  children: ReactNode;
  className?: string;
  id?: string;
};

export function Text({ as, variant, children, className, id }: TextProps) {
  const Component = (as ?? defaultElement[variant]) as ElementType;
  return (
    <Component className={cn(variantClass[variant], className)} id={id}>
      {children}
    </Component>
  );
}
