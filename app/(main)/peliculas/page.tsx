import { Suspense } from 'react';
import type { Metadata } from 'next';
import { searchMovies, getMovieGenres } from '@/lib/api/tmdb';
import { cacheItems, getCachedItemsByExternalIds } from '@/lib/cache/items';
import { ItemGrid, ItemGridSkeleton } from '@/components/items/ItemGrid';
import { GenreFilter } from '@/components/items/GenreFilter';
import { SearchBar } from '@/components/items/SearchBar';
import { Pagination } from '@/components/items/Pagination';
import type { Item } from '@/types';

export const metadata: Metadata = {
  title: 'Películas — Explora y descubre',
};

interface PeliculasPageProps {
  searchParams: Promise<{ q?: string; genero?: string; pagina?: string }>;
}

export default async function PeliculasPage({ searchParams }: PeliculasPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const genreId = params.genero || '';
  const page = Number(params.pagina) || 1;

  const [genres, searchResult] = await Promise.all([
    getMovieGenres(),
    searchMovies({ query, genreId, page }),
  ]);

  cacheItems(searchResult.items).catch(console.error);

  const cachedMap = await getCachedItemsByExternalIds(
    'pelicula',
    searchResult.items.map((i) => i.external_id)
  );

  const itemsWithStats: Item[] = searchResult.items.map((ext) => {
    const cached = cachedMap.get(ext.external_id);
    return cached ?? {
      id: `pelicula_${ext.external_id}`,
      ...ext,
      cached_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      avg_rating: 0,
      rating_count: 0,
      favorite_count: 0,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-4xl font-extrabold tracking-tight">Películas</h1>
        <p className="text-sm text-muted-foreground pb-1">
          {searchResult.total.toLocaleString('es')} títulos
        </p>
      </div>

      <SearchBar />

      <Suspense>
        <GenreFilter genres={genres} selectedId={genreId} />
      </Suspense>

      <Suspense fallback={<ItemGridSkeleton />}>
        <ItemGrid items={itemsWithStats} />
      </Suspense>

      <Suspense>
        <Pagination currentPage={page} hasNextPage={searchResult.has_next_page} />
      </Suspense>
    </div>
  );
}
