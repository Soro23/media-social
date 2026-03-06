'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, MessageSquare, Lock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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

export interface RatingEntry {
  score: number;
  updatedAt: string;
  item: Item;
}

export interface ActivityComment {
  id: string;
  content: string;
  createdAt: string;
  item: Item | null;
}

interface PublicProfileTabsProps {
  favItems: Item[];
  favoritesPublic: boolean;
  isOwner: boolean;
  ratings: RatingEntry[];
  comments: ActivityComment[];
}

export function PublicProfileTabs({
  favItems,
  favoritesPublic,
  isOwner,
  ratings,
  comments,
}: PublicProfileTabsProps) {
  const showFavorites = isOwner || favoritesPublic;

  return (
    <Tabs defaultValue="favoritos">
      <TabsList>
        <TabsTrigger value="favoritos">
          <Heart className="h-4 w-4" />
          Favoritos
          {showFavorites && (
            <span className="ml-1 text-xs opacity-60">({favItems.length})</span>
          )}
        </TabsTrigger>
        <TabsTrigger value="ratings">
          <Star className="h-4 w-4" />
          Ratings
          <span className="ml-1 text-xs opacity-60">({ratings.length})</span>
        </TabsTrigger>
        <TabsTrigger value="actividad">
          <MessageSquare className="h-4 w-4" />
          Actividad
          <span className="ml-1 text-xs opacity-60">({comments.length})</span>
        </TabsTrigger>
      </TabsList>

      {/* ── Favoritos ── */}
      <TabsContent value="favoritos" className="mt-6">
        {!showFavorites ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground border rounded-xl">
            <Lock className="h-8 w-8" />
            <p>Este usuario tiene sus favoritos en privado</p>
          </div>
        ) : favItems.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            {isOwner ? 'Aún no tienes favoritos guardados' : 'No hay favoritos para mostrar'}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favItems.map((item) => (
              <Link
                key={item.id}
                href={`${CATEGORY_PATHS[item.category]}/${item.external_id}`}
                className="group"
              >
                <div className="space-y-2">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
                    {item.cover_url ? (
                      <Image
                        src={item.cover_url}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 50vw, 20vw"
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {CATEGORY_LABELS[item.category]}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </TabsContent>

      {/* ── Ratings ── */}
      <TabsContent value="ratings" className="mt-6">
        {ratings.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            {isOwner ? 'Aún no has puntuado ningún título' : 'No hay puntuaciones para mostrar'}
          </p>
        ) : (
          <div className="space-y-2">
            {ratings.map(({ item, score, updatedAt }) => (
              <Link
                key={item.id}
                href={`${CATEGORY_PATHS[item.category]}/${item.external_id}`}
                className="group flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                {/* Portada */}
                <div className="relative h-16 w-11 flex-shrink-0 overflow-hidden rounded bg-muted">
                  {item.cover_url ? (
                    <Image
                      src={item.cover_url}
                      alt={item.title}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                      —
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {CATEGORY_LABELS[item.category]}
                    </Badge>
                    {item.year && (
                      <span className="text-xs text-muted-foreground">{item.year}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(updatedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Puntuación */}
                <div className="flex flex-shrink-0 items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-xl font-bold tabular-nums">{score}</span>
                  <span className="text-xs text-muted-foreground">/10</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </TabsContent>

      {/* ── Actividad ── */}
      <TabsContent value="actividad" className="mt-6">
        {comments.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            {isOwner ? 'Aún no has dejado comentarios' : 'No hay actividad reciente'}
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map(({ id, content, createdAt, item }) => (
              <div key={id} className="rounded-lg border p-4 space-y-3">
                {/* Item contexto */}
                {item && (
                  <Link
                    href={`${CATEGORY_PATHS[item.category]}/${item.external_id}`}
                    className="group flex items-center gap-3"
                  >
                    <div className="relative h-10 w-7 flex-shrink-0 overflow-hidden rounded bg-muted">
                      {item.cover_url && (
                        <Image
                          src={item.cover_url}
                          alt={item.title}
                          fill
                          sizes="28px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                        {item.title}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {CATEGORY_LABELS[item.category]}
                      </Badge>
                    </div>
                  </Link>
                )}

                {/* Comentario */}
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                  &ldquo;{content}&rdquo;
                </p>

                <p className="text-xs text-muted-foreground">
                  {new Date(createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
