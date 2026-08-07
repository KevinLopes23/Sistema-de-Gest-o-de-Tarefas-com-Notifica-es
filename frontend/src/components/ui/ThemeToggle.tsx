import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/app/ThemeProvider';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      title={isDark ? 'Tema claro' : 'Tema escuro'}
      className={
        // Grid em vez de absolute/relative para empilhar os ícones: assim o botão não
        // reivindica nenhuma utility de "position", e quem usa o componente pode passar
        // fixed/absolute via className sem risco de o "relative" interno vencer o cascade.
        'grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-slate-200 text-slate-500 ' +
        'transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 ' +
        'dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-500/40 dark:hover:bg-slate-800 dark:hover:text-brand-300 ' +
        (className ?? '')
      }
    >
      <Sun
        className={
          '[grid-area:1/1] h-[18px] w-[18px] transition-all duration-300 ' +
          (isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100')
        }
      />
      <Moon
        className={
          '[grid-area:1/1] h-[18px] w-[18px] transition-all duration-300 ' +
          (isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0')
        }
      />
    </button>
  );
}
