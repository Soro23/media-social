import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import type { Category, Item } from '@/types';

const CATEGORY_PATHS: Record<Category, string> = {
  anime: '/anime',
  manga: '/manga',
  libro: '/libros',
  pelicula: '/peliculas',
  serie: '/series',
};

const CATEGORY_LABELS: Record<Category, string> = {
  anime: 'Anime',
  manga: 'Manga',
  libro: 'Libro',
  pelicula: 'Película',
  serie: 'Serie',
};

// Subtle color per category for the badge
const CATEGORY_COLORS: Record<Category, string> = {
  anime:    'bg-violet-500/90 text-white',
  manga:    'bg-orange-700/90 text-white',
  libro:    'bg-amber-500/90 text-white',
  pelicula: 'bg-rose-500/90 text-white',
  serie:    'bg-emerald-500/90 text-white',
};

interface ItemCardProps {
  item: Item;
  showCategory?: boolean;
  priority?: boolean;
}

export function ItemCard({ item, showCategory = false, priority = false }: ItemCardProps) {
  const path = `${CATEGORY_PATHS[item.category]}/${item.external_id}`;

  return (
    <Link href={path} className="group block">
      <div className="relative overflow-hidden rounded-xl bg-muted shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-primary/10">
        {/* Poster */}
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          {item.cover_url ? (
            <Image
              src={item.cover_url}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-xs">
              Sin imagen
            </div>
          )}

          {/* Gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Category badge */}
          {showCategory && (
            <div className="absolute top-2 left-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm ${CATEGORY_COLORS[item.category]}`}>
                {CATEGORY_LABELS[item.category]}
              </span>
            </div>
          )}

          {/* Rating badge */}
          {item.rating_count > 0 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-black/75 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{item.avg_rating}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-2.5">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-150">
            {item.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            {item.year && (
              <span className="text-[11px] text-muted-foreground">{item.year}</span>
            )}
            {item.year && item.genres.length > 0 && (
              <span className="text-[11px] text-muted-foreground">·</span>
            )}
            {item.genres.length > 0 && (
              <span className="text-[11px] text-muted-foreground truncate">
                {item.genres[0]}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
