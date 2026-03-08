import Image from 'next/image';
import { Star, Heart, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { RatingWidget } from '@/components/items/RatingWidget';
import { CommentList } from '@/components/comments/CommentList';
import { CommentForm } from '@/components/comments/CommentForm';
import { BackButton } from '@/components/items/BackButton';
import { ItemExtraInfo } from '@/components/items/ItemExtraInfo';
import { ItemRecommendations } from '@/components/items/ItemRecommendations';
import type { Item, CommentWithProfile } from '@/types';

interface ItemDetailLayoutProps {
  item: Item;
  categoryLabel: string;
  categoryHref: string;
  comments: CommentWithProfile[];
  isFavorite: boolean;
  userScore: number | null;
  userId: string | null;
}

export function ItemDetailLayout({
  item,
  categoryLabel,
  categoryHref,
  comments,
  isFavorite,
  userScore,
  userId,
}: ItemDetailLayoutProps) {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <div className="py-3">
        <BackButton fallbackHref={categoryHref} label={categoryLabel} />
      </div>

      {/* Hero — pure visual backdrop, no readable content inside */}
      <div className="relative -mx-4 h-44 sm:h-60 overflow-hidden rounded-t-2xl">
        {item.cover_url ? (
          <Image
            src={item.cover_url}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            style={{ filter: 'blur(32px) brightness(0.25)', transform: 'scale(1.2)' }}
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-primary/10 to-muted" />
        )}
        {/* fade to background at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      {/* Poster + header info — overlapping hero */}
      <div className="relative z-10 -mt-20 sm:-mt-28 flex gap-4 sm:gap-6 px-0 items-end">
        {/* Poster */}
        <div className="w-28 sm:w-44 flex-shrink-0">
          <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-2 ring-background bg-muted">
            {item.cover_url ? (
              <Image
                src={item.cover_url}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 112px, 176px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs p-2 text-center">
                Sin imagen
              </div>
            )}
          </div>
        </div>

        {/* Title / badges / stats */}
        <div className="flex-1 min-w-0 pb-1 sm:pb-3 space-y-2">
          {/* Category + year badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge className="bg-primary text-primary-foreground border-0 text-xs">
              {categoryLabel}
            </Badge>
            {item.year && (
              <Badge variant="outline" className="text-xs border-border/60">
                {item.year}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-3xl font-bold leading-tight line-clamp-3">
            {item.title}
          </h1>

          {/* Genres */}
          {item.genres.length > 0 && (
            <div className="hidden sm:flex flex-wrap gap-1.5">
              {item.genres.slice(0, 5).map((g) => (
                <span
                  key={g}
                  className="text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
              <span className="font-bold text-lg leading-none">
                {item.avg_rating > 0 ? item.avg_rating : '—'}
              </span>
              <span className="text-muted-foreground text-xs">/10</span>
            </div>
            {item.rating_count > 0 && (
              <span className="text-muted-foreground text-xs">
                {item.rating_count.toLocaleString('es')} {item.rating_count === 1 ? 'voto' : 'votos'}
              </span>
            )}
            {item.favorite_count > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground text-xs">
                <Heart className="h-3.5 w-3.5" />
                {item.favorite_count.toLocaleString('es')}
              </span>
            )}
            {comments.length > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground text-xs">
                <MessageCircle className="h-3.5 w-3.5" />
                {comments.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile genres (below poster row) */}
      {item.genres.length > 0 && (
        <div className="flex sm:hidden flex-wrap gap-1.5 mt-3">
          {item.genres.slice(0, 5).map((g) => (
            <span
              key={g}
              className="text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5"
            >
              {g}
            </span>
          ))}
        </div>
      )}

      {/* Main content area */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Left sidebar: actions */}
        <div className="space-y-4">
          {/* Favorite */}
          <FavoriteButton
            itemId={item.id}
            initialIsFavorite={isFavorite}
            isAuthenticated={!!userId}
          />

          {/* User rating */}
          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Tu puntuación
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <RatingWidget
                itemId={item.id}
                currentUserScore={userScore}
                avgRating={item.avg_rating}
                ratingCount={item.rating_count}
                isAuthenticated={!!userId}
                showCommunityAvg={false}
              />
            </CardContent>
          </Card>

          {/* Extra metadata */}
          <ItemExtraInfo item={item} />
        </div>

        {/* Right: description + recommendations */}
        <div className="sm:col-span-2 space-y-6">
          {/* Description */}
          {item.description ? (
            <div>
              <h2 className="text-base font-semibold mb-2 text-foreground">Sinopsis</h2>
              <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">
                {item.description}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Sin sinopsis disponible.</p>
          )}

          {/* Recommendations / Similar */}
          <ItemRecommendations item={item} />
        </div>
      </div>

      {/* Comments */}
      <div className="mt-10">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Discusión</h2>
          {comments.length > 0 && (
            <Badge variant="secondary" className="font-normal text-xs">
              {comments.length}
            </Badge>
          )}
        </div>

        <Card className="border-border/50">
          <CardContent className="p-5">
            <CommentForm itemId={item.id} isAuthenticated={!!userId} />
            {comments.length > 0 ? (
              <div className="mt-4 divide-y divide-border/50">
                <CommentList comments={comments} currentUserId={userId} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <MessageCircle className="h-8 w-8 opacity-30" />
                <p className="text-sm">Sé el primero en comentar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
