import { Suspense } from 'react';
import type { Metadata } from 'next';
import { searchManga, getMangaGenres } from '@/lib/api/jikan';
import { cacheItems, getCachedItemsByExternalIds } from '@/lib/cache/items';
import { ItemGrid, ItemGridSkeleton } from '@/components/items/ItemGrid';
import { BrowseFilters } from '@/components/items/BrowseFilters';
import { Pagination } from '@/components/items/Pagination';
import type { Item } from '@/types';

export const metadata: Metadata = {
  title: 'Manga — Explora y descubre',
};

interface MangaPageProps {
  searchParams: Promise<{ q?: string; genero?: string; pagina?: string }>;
}

export default async function MangaPage({ searchParams }: MangaPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const genreId = params.genero || '';
  const page = Number(params.pagina) || 1;

  const [genres, searchResult] = await Promise.all([
    getMangaGenres(),
    searchManga({ query, genre: genreId, page }),
  ]);

  cacheItems(searchResult.items).catch(console.error);

  const cachedMap = await getCachedItemsByExternalIds(
    'manga',
    searchResult.items.map((i) => i.external_id)
  );

  const itemsWithStats: Item[] = searchResult.items.map((ext) => {
    const cached = cachedMap.get(ext.external_id);
    return cached ?? {
      id: `manga_${ext.external_id}`,
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
        <h1 className="text-4xl font-extrabold tracking-tight">Manga</h1>
        <p className="text-sm text-muted-foreground pb-1">
          {searchResult.total.toLocaleString('es')} títulos
        </p>
      </div>

      <BrowseFilters genres={genres} selectedGenreId={genreId} />

      <Suspense fallback={<ItemGridSkeleton />}>
        <ItemGrid items={itemsWithStats} />
      </Suspense>

      <Suspense>
        <Pagination currentPage={page} hasNextPage={searchResult.has_next_page} totalPages={searchResult.total_pages} />
      </Suspense>
    </div>
  );
}
