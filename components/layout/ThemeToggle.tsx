'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/* ── Desktop: botón icono animado que alterna light ↔ dark ── */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative h-9 w-9 rounded-lg flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:bg-accent hover:border-primary/30 transition-all duration-200"
    >
      {/* Sun — visible en dark mode */}
      <Sun
        className={cn(
          'absolute h-4 w-4 transition-all duration-300',
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
        )}
      />
      {/* Moon — visible en light mode */}
      <Moon
        className={cn(
          'absolute h-4 w-4 transition-all duration-300',
          isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
        )}
      />
    </button>
  );
}

/* ── Móvil: mismo botón icono animado que el desktop ── */
export function ThemeToggleMobile() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="flex items-center justify-between px-3 py-2.5">
      <span className="text-sm text-muted-foreground">
        {isDark ? 'Modo oscuro' : 'Modo claro'}
      </span>
      <button
        type="button"
        title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="relative h-9 w-9 rounded-lg flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:bg-accent hover:border-primary/30 transition-all duration-200"
      >
        <Sun
          className={cn(
            'absolute h-4 w-4 transition-all duration-300',
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
          )}
        />
        <Moon
          className={cn(
            'absolute h-4 w-4 transition-all duration-300',
            isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
          )}
        />
      </button>
    </div>
  );
}
