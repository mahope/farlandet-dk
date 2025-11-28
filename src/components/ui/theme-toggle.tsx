import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative flex items-center justify-center',
        'w-10 h-10 rounded-full',
        'bg-muted hover:bg-muted/80',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      aria-label={isDark ? 'Skift til lys tilstand' : 'Skift til mørk tilstand'}
    >
      <Sun
        className={cn(
          'h-5 w-5 transition-all duration-300',
          isDark
            ? 'rotate-90 scale-0 text-foreground'
            : 'rotate-0 scale-100 text-accent-500'
        )}
      />
      <Moon
        className={cn(
          'absolute h-5 w-5 transition-all duration-300',
          isDark
            ? 'rotate-0 scale-100 text-secondary-400'
            : '-rotate-90 scale-0 text-foreground'
        )}
      />
    </button>
  );
}

export default ThemeToggle;
