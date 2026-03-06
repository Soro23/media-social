'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
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
    params.delete('pagina'); // Reiniciar paginación al cambiar género

    router.push(`${pathname}?${params.toString()}`);
  }

  function handleClear() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('genero');
    params.delete('pagina');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={!selectedId ? 'default' : 'outline'}
        className="cursor-pointer hover:opacity-80"
        onClick={handleClear}
      >
        Todos
      </Badge>
      {genres.map((genre) => (
        <Badge
          key={genre.id}
          variant={selectedId === String(genre.id) ? 'default' : 'outline'}
          className="cursor-pointer hover:opacity-80"
          onClick={() => handleSelect(genre.id)}
        >
          {genre.name}
        </Badge>
      ))}
    </div>
  );
}
