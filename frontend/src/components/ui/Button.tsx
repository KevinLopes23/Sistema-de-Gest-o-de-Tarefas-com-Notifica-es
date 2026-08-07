import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/25 ' +
    'hover:shadow-lg hover:shadow-brand-600/35 hover:-translate-y-0.5 hover:brightness-105 ' +
    'active:translate-y-0 active:brightness-95 focus-visible:outline-brand-600 disabled:from-brand-300 disabled:to-brand-300 disabled:shadow-none disabled:translate-y-0',
  secondary:
    'bg-white text-slate-700 border border-slate-200 shadow-sm hover:border-brand-200 hover:bg-brand-50/60 hover:text-brand-700 hover:-translate-y-0.5 ' +
    'active:translate-y-0 focus-visible:outline-brand-600 disabled:text-slate-400 disabled:translate-y-0 ' +
    'dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:border-brand-500/40 dark:hover:bg-slate-700 dark:hover:text-brand-300',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-red-600 disabled:bg-red-300 disabled:translate-y-0',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:outline-brand-600 dark:text-slate-300 dark:hover:bg-slate-800',
};

export function Button({ variant = 'primary', loading, disabled, className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all duration-200',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed',
        variantClasses[variant],
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
