import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

interface ItemCardProps {
  item: Item;
  showCategory?: boolean;
  priority?: boolean;
}

export function ItemCard({ item, showCategory = false, priority = false }: ItemCardProps) {
  const path = `${CATEGORY_PATHS[item.category]}/${item.external_id}`;

  return (
    <Link href={path} className="group">
      <Card className="overflow-hidden h-full transition-shadow hover:shadow-lg py-0">
        <div className="relative aspect-[2/3] w-full bg-muted overflow-hidden">
          {item.cover_url ? (
            <Image
              src={item.cover_url}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform group-hover:scale-105"
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              Sin imagen
            </div>
          )}

          {/* Badge de categoría */}
          {showCategory && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs">
                {CATEGORY_LABELS[item.category]}
              </Badge>
            </div>
          )}

          {/* Rating overlay */}
          {item.rating_count > 0 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>{item.avg_rating}</span>
            </div>
          )}
        </div>

        <CardContent className="p-3">
          <h3 className="font-medium text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {item.title}
          </h3>
          {item.year && (
            <p className="text-xs text-muted-foreground mt-1">{item.year}</p>
          )}
          {item.genres.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {item.genres.slice(0, 2).join(' · ')}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
