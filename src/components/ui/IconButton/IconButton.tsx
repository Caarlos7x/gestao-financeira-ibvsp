import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';
import styles from '@/components/ui/IconButton/IconButton.module.css';

export type IconButtonSize = 'sm' | 'md';

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  /** Acessibilidade: botão só com ícone exige rótulo para leitores de tela. */
  'aria-label': string;
  size?: IconButtonSize;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      children,
      type = 'button',
      size = 'md',
      className,
      ...rest
    },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          styles.root,
          size === 'sm' && styles.sizeSm,
          size === 'md' && styles.sizeMd,
          className
        )}
        {...rest}
      >
        <span className={styles.iconSlot}>{children}</span>
      </button>
    );
  }
);
