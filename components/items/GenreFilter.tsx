'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Genre } from '@/types';

interface GenreFilterProps {
  genres: Genre[];
  selectedId?: string;
}

export function GenreFilter({ genres, selectedId }: GenreFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSelect(id: string | number) {
    const params = new URLSearchParams(searchParams.toString());
    const stringId = String(id);
    if (selectedId === stringId) {
      params.delete('genero');
    } else {
      params.set('genero', stringId);
    }
    params.delete('pagina');
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleClear() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('genero');
    params.delete('pagina');
    router.push(`${pathname}?${params.toString()}`);
  }

  const seen = new Set<string>();
  const uniqueGenres = genres.filter((g) => {
    const key = String(g.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const pillClass = (active: boolean) =>
    cn(
      'inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer select-none border',
      active
        ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25'
        : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
    );

  return (
    <div className="flex flex-wrap gap-2">
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
    </div>
  );
}
