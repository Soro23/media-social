import { Suspense } from 'react';
import { SearchBar } from '@/components/items/SearchBar';
import { GenreFilter } from '@/components/items/GenreFilter';
import type { Genre } from '@/types';

interface BrowseFiltersProps {
  genres: Genre[];
  selectedGenreId?: string;
}

export function BrowseFilters({ genres, selectedGenreId }: BrowseFiltersProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden shadow-sm">
      {/* Search row */}
      <div className="px-4 pt-4 pb-3">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      {/* Divider */}
      <div className="h-px bg-border/50 mx-4" />

      {/* Genre filter */}
      <div className="px-4 py-3">
        <Suspense>
          <GenreFilter genres={genres} selectedId={selectedGenreId} />
        </Suspense>
      </div>
    </div>
  );
}
