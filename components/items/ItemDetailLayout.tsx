import Image from 'next/image';
import { Star, Heart, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

      {/* Hero banner */}
      <div className="relative -mx-4 h-64 sm:h-80 overflow-hidden">
        {item.cover_url ? (
          <Image
            src={item.cover_url}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            style={{ filter: 'blur(28px) brightness(0.3)', transform: 'scale(1.15)' }}
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-muted" />
        )}
        {/* gradient fade to page bg at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        {/* Title area inside hero */}
        <div className="relative h-full max-w-5xl mx-auto px-4 flex items-end pb-6 gap-6">
          <div className="hidden sm:block w-40 flex-shrink-0" /> {/* poster placeholder */}
          <div className="flex-1 min-w-0 pb-2">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary/80 text-primary-foreground border-0 backdrop-blur">
                {categoryLabel}
              </Badge>
              {item.year && (
                <Badge variant="outline" className="border-white/30 text-white/80 bg-black/20 backdrop-blur">
                  {item.year}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold leading-tight text-white drop-shadow-lg line-clamp-2">
              {item.title}
            </h1>
            {item.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.genres.slice(0, 5).map((g) => (
                  <span
                    key={g}
                    className="text-xs text-white/70 bg-white/10 backdrop-blur rounded-full px-2.5 py-0.5"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Poster + content row */}
      <div className="flex gap-6 -mt-20 sm:-mt-28 relative z-10 px-0">
        {/* Poster */}
        <div className="hidden sm:block w-40 flex-shrink-0">
          <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-4 ring-background bg-muted">
            {item.cover_url ? (
              <Image
                src={item.cover_url}
                alt={item.title}
                fill
                sizes="160px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
                Sin imagen
              </div>
            )}
          </div>
        </div>

        {/* Info column */}
        <div className="flex-1 min-w-0 pt-24 sm:pt-0 sm:pb-4 space-y-5">
          {/* Stat bar */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
              <span className="text-2xl font-bold">{item.avg_rating > 0 ? item.avg_rating : '—'}</span>
              <span className="text-muted-foreground text-sm">/10</span>
            </div>
            {item.rating_count > 0 && (
              <span className="text-muted-foreground">
                {item.rating_count.toLocaleString('es')} {item.rating_count === 1 ? 'voto' : 'votos'}
              </span>
            )}
            {item.favorite_count > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Heart className="h-4 w-4" />
                {item.favorite_count.toLocaleString('es')}
              </span>
            )}
            {comments.length > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                {comments.length}
              </span>
            )}
          </div>

          {/* Action card */}
          <Card className="border-border/60 bg-card shadow-sm">
            <CardContent className="p-5 space-y-4">
              <RatingWidget
                itemId={item.id}
                currentUserScore={userScore}
                avgRating={item.avg_rating}
                ratingCount={item.rating_count}
                isAuthenticated={!!userId}
              />
              <FavoriteButton
                itemId={item.id}
                initialIsFavorite={isFavorite}
                isAuthenticated={!!userId}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Description */}
      {item.description && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Sinopsis</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {item.description}
          </p>
        </div>
      )}

      {/* Extra info: status, creators, streaming, related */}
      <ItemExtraInfo item={item} />

      {/* Recommendations / Similar */}
      <ItemRecommendations item={item} />

      {/* Comments section */}
      <div className="mt-10 space-y-4">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Discusion</h2>
          {comments.length > 0 && (
            <Badge variant="secondary" className="font-normal">
              {comments.length}
            </Badge>
          )}
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5">
            <CommentForm itemId={item.id} isAuthenticated={!!userId} />
            {comments.length > 0 && (
              <div className="mt-2">
                <CommentList comments={comments} currentUserId={userId} />
              </div>
            )}
            {comments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                Se el primero en comentar
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
