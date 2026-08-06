import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import clsx from 'clsx';

const fieldClasses =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 ' +
  'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 ' +
  'disabled:bg-slate-50 disabled:text-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100';

interface FieldWrapperProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
  labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
}

export function FieldWrapper({ label, htmlFor, error, children, labelProps }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700 dark:text-slate-300" {...labelProps}>
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(fieldClasses, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx(fieldClasses, 'min-h-[90px] resize-y', className)} {...rest} />;
}

export function Select({ className, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return <select className={clsx(fieldClasses, 'bg-white dark:bg-slate-900', className)} {...rest} />;
}
