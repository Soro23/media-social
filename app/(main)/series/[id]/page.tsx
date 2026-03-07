import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSerieById } from '@/lib/api/tmdb';
import { getOrCacheItem } from '@/lib/cache/items';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';
import { Query } from 'node-appwrite';
import { ItemDetailLayout } from '@/components/items/ItemDetailLayout';
import type { CommentWithProfile } from '@/types';

interface SerieDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SerieDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const item = await getOrCacheItem(id, 'serie', () => getSerieById(id));
  if (!item) return { title: 'Serie no encontrada' };
  return { title: item.title, description: item.description?.slice(0, 160) };
}

export default async function SerieDetailPage({ params }: SerieDetailPageProps) {
  const { id } = await params;
  const item = await getOrCacheItem(id, 'serie', () => getSerieById(id));
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
    <ItemDetailLayout
      item={item}
      categoryLabel="Series"
      categoryHref="/series"
      comments={comments}
      isFavorite={isFavorite}
      userScore={userScore}
      userId={userId}
    />
  );
}
