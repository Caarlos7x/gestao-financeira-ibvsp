import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';
import styles from '@/components/ui/Button/Button.module.css';

export type ButtonVariant = 'primary' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      type = 'button',
      variant = 'primary',
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
          variant === 'primary' && styles.primary,
          variant === 'ghost' && styles.ghost,
          variant === 'outline' && styles.outline,
          className
        )}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
