import clsx from 'clsx';

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className={clsx(
        'h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600',
        className,
      )}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex h-full min-h-[240px] w-full items-center justify-center">
      <Spinner />
    </div>
  );
}
