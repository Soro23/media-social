import { ItemCard } from './ItemCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Item } from '@/types';

interface ItemGridProps {
  items: Item[];
  showCategory?: boolean;
}

export function ItemGrid({ items, showCategory = false }: ItemGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">No se encontraron resultados</p>
        <p className="text-sm mt-1">Prueba con otra búsqueda o género</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <ItemCard key={`${item.category}-${item.external_id}`} item={item} showCategory={showCategory} />
      ))}
    </div>
  );
}

export function ItemGridSkeleton({ count = 24 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
