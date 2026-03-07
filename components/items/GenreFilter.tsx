'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Genre } from '@/types';

const DESKTOP_INITIAL = 14;

interface GenreFilterProps {
  genres: Genre[];
  selectedId?: string;
}

export function GenreFilter({ genres, selectedId }: GenreFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState(false);

  const uniqueGenres = (() => {
    const seen = new Set<string>();
    return genres.filter((g) => {
      const key = String(g.id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();

  function navigate(params: URLSearchParams) {
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSelect(id: string | number) {
    const params = new URLSearchParams(searchParams.toString());
    const stringId = String(id);
    if (selectedId === stringId) {
      params.delete('genero');
    } else {
      params.set('genero', stringId);
    }
    params.delete('pagina');
    navigate(params);
  }

  function handleClear() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('genero');
    params.delete('pagina');
    navigate(params);
  }

  const pillClass = (active: boolean) =>
    cn(
      'inline-flex items-center whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer select-none border flex-shrink-0',
      active
        ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25'
        : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:bg-accent/50'
    );

  const desktopGenres = expanded ? uniqueGenres : uniqueGenres.slice(0, DESKTOP_INITIAL);
  const hiddenCount = uniqueGenres.length - DESKTOP_INITIAL;

  return (
    <div className="space-y-2">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Género
          {selectedId && (
            <span className="ml-2 normal-case text-primary font-semibold">
              · {uniqueGenres.find((g) => String(g.id) === selectedId)?.name}
            </span>
          )}
        </span>
        {selectedId && (
          <button
            onClick={handleClear}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="relative md:hidden">
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <button className={pillClass(!selectedId)} onClick={handleClear}>
            Todos
          </button>
          {uniqueGenres.map((genre) => (
            <button
              key={genre.id}
              className={pillClass(selectedId === String(genre.id))}
              onClick={() => handleSelect(genre.id)}
            >
              {genre.name}
            </button>
          ))}
          {/* Spacer so last item isn't hidden by fade */}
          <span className="flex-shrink-0 w-4" />
        </div>
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-1 w-4 bg-gradient-to-r from-card to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none" />
      </div>

      {/* Desktop: wrap + expand */}
      <div className="hidden md:block">
        <div className="flex flex-wrap gap-2">
          <button className={pillClass(!selectedId)} onClick={handleClear}>
            Todos
          </button>
          {desktopGenres.map((genre) => (
            <button
              key={genre.id}
              className={pillClass(selectedId === String(genre.id))}
              onClick={() => handleSelect(genre.id)}
            >
              {genre.name}
            </button>
          ))}
          {hiddenCount > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-medium border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Mostrar menos
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  {hiddenCount} más
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
