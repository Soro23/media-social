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

const CATEGORY_COLORS: Record<Category, string> = {
  anime:    'bg-violet-600/90',
  manga:    'bg-rose-600/90',
  libro:    'bg-sky-600/90',
  pelicula: 'bg-slate-600/90',
  serie:    'bg-emerald-600/90',
};

interface ItemCardProps {
  item: Item;
  showCategory?: boolean;
  priority?: boolean;
}

export function ItemCard({ item, showCategory = false, priority = false }: ItemCardProps) {
  const path = `${CATEGORY_PATHS[item.category]}/${item.external_id}`;

  return (
    <Link href={path} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl">
      <article className="overflow-hidden rounded-2xl ring-1 ring-black/8 dark:ring-white/8 transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-primary/25 group-hover:ring-primary/50">

        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          {item.cover_url ? (
            <Image
              src={item.cover_url}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-muted-foreground/30 text-xs">Sin imagen</span>
            </div>
          )}

          {/* Permanent bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

          {/* Category badge */}
          {showCategory && (
            <span className={`absolute top-2 left-2 text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full text-white backdrop-blur-sm ${CATEGORY_COLORS[item.category]}`}>
              {CATEGORY_LABELS[item.category]}
            </span>
          )}

          {/* Rating pill */}
          {item.rating_count > 0 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-0.5 rounded-md bg-black/70 backdrop-blur-sm px-1.5 py-0.5">
              <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
              <span className="text-[11px] font-bold text-white leading-none">{item.avg_rating}</span>
            </div>
          )}

          {/* Hover overlay shimmer */}
          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay" />
        </div>

        {/* Info */}
        <div className="bg-card px-3 py-2.5">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200">
            {item.title}
          </h3>
          {(item.year || item.genres.length > 0) && (
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {[item.year, item.genres[0]].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
