import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getMovieById } from '@/lib/api/tmdb';
import { getOrCacheItem } from '@/lib/cache/items';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';
import { Query } from 'node-appwrite';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { RatingWidget } from '@/components/items/RatingWidget';
import { CommentList } from '@/components/comments/CommentList';
import { CommentForm } from '@/components/comments/CommentForm';
import type { CommentWithProfile } from '@/types';

interface PeliculaDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PeliculaDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getOrCacheItem(id, 'pelicula', () => getMovieById(id));
  if (!item) return { title: 'Película no encontrada' };
  return { title: item.title, description: item.description?.slice(0, 160) };
}

export default async function PeliculaDetailPage({ params }: PeliculaDetailPageProps) {
  const { id } = await params;
  const item = await getOrCacheItem(id, 'pelicula', () => getMovieById(id));
  if (!item) notFound();

  let userId: string | null = null;
  try {
    const { account } = await createSessionClient();
    userId = (await account.get()).$id;
  } catch { /* no autenticado */ }

  const [favoriteResult, ratingResult, commentsResult] = await Promise.all([
    userId
      ? createAdminClient().databases.listDocuments(DATABASE_ID, COLLECTIONS.FAVORITES, [
          Query.equal('user_id', userId), Query.equal('item_id', item.id), Query.limit(1),
        ])
      : Promise.resolve(null),
    userId
      ? createAdminClient().databases.listDocuments(DATABASE_ID, COLLECTIONS.RATINGS, [
          Query.equal('user_id', userId), Query.equal('item_id', item.id), Query.limit(1),
        ])
      : Promise.resolve(null),
    createAdminClient().databases.listDocuments(DATABASE_ID, COLLECTIONS.COMMENTS, [
      Query.equal('item_id', item.id), Query.orderDesc('$createdAt'), Query.limit(50),
    ]),
  ]);

  const isFavorite = (favoriteResult?.total ?? 0) > 0;
  const userScore = ratingResult?.total ? (ratingResult.documents[0].score as number) : null;
  const comments: CommentWithProfile[] = commentsResult.documents.map((doc) => ({
    id: doc.$id,
    user_id: doc.user_id as string,
    item_id: doc.item_id as string,
    content: doc.content as string,
    created_at: doc.$createdAt,
    updated_at: doc.$updatedAt,
    username: doc.username as string,
    avatar_url: (doc.avatar_url as string) || null,
    profiles: { username: doc.username as string, display_name: null, avatar_url: (doc.avatar_url as string) || null },
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <div className="mx-auto md:mx-0 w-48 md:w-full">
          <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-lg bg-muted">
            {item.cover_url ? (
              <Image src={item.cover_url} alt={item.title} fill sizes="(max-width: 768px) 192px, 240px" className="object-cover" priority />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">Sin imagen</div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">Película</Badge>
              {item.year && <Badge variant="secondary">{item.year}</Badge>}
            </div>
            <h1 className="text-3xl font-bold leading-tight">{item.title}</h1>
          </div>
          {item.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.genres.map((g) => <Badge key={g} variant="secondary">{g}</Badge>)}
            </div>
          )}
          <RatingWidget itemId={item.id} currentUserScore={userScore} avgRating={item.avg_rating} ratingCount={item.rating_count} isAuthenticated={!!userId} />
          <FavoriteButton itemId={item.id} initialIsFavorite={isFavorite} isAuthenticated={!!userId} />
          {item.favorite_count > 0 && (
            <p className="text-sm text-muted-foreground">
              {item.favorite_count} {item.favorite_count === 1 ? 'persona lo tiene' : 'personas lo tienen'} en favoritos
            </p>
          )}
        </div>
      </div>
      {item.description && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Sinopsis</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{item.description}</p>
        </div>
      )}
      <Separator />
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">
          Comentarios <span className="text-muted-foreground font-normal text-base">({comments.length})</span>
        </h2>
        <CommentForm itemId={item.id} isAuthenticated={!!userId} />
        <CommentList comments={comments} currentUserId={userId} />
      </div>
    </div>
  );
}
