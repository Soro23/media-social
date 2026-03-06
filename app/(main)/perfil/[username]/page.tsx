import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Query } from 'node-appwrite';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';
import { getItemsByIds } from '@/lib/cache/items';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PublicProfileTabs } from '@/components/profile/PublicProfileTabs';
import type { RatingEntry, ActivityComment } from '@/components/profile/PublicProfileTabs';
import type { Profile } from '@/types';

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;

  const profilesResult = await createAdminClient().databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
    Query.equal('username', username.toLowerCase()),
    Query.limit(1),
  ]);

  if (profilesResult.total === 0) notFound();

  const doc = profilesResult.documents[0];
  const profile: Profile = {
    id: doc.$id,
    username: doc.username as string,
    display_name: (doc.display_name as string) || null,
    bio: (doc.bio as string) || null,
    avatar_url: (doc.avatar_url as string) || null,
    favorites_public: doc.favorites_public as boolean,
    username_locked: doc.username_locked as boolean,
    created_at: doc.$createdAt,
    updated_at: doc.$updatedAt,
  };

  let currentUserId: string | null = null;
  try {
    const { account } = await createSessionClient();
    currentUserId = (await account.get()).$id;
  } catch { /* no autenticado */ }

  const isOwner = currentUserId === profile.id;

  // Fetch en paralelo: favoritos, ratings y comentarios
  // Cada llamada usa su propia instancia del cliente para evitar conflictos de concurrencia
  const empty = { documents: [], total: 0 };

  const [favResult, ratingsResult, commentsResult] = await Promise.all([
    (isOwner || profile.favorites_public)
      ? createAdminClient().databases
          .listDocuments(DATABASE_ID, COLLECTIONS.FAVORITES, [
            Query.equal('user_id', profile.id),
            Query.orderDesc('$createdAt'),
            Query.limit(250),
          ])
          .catch(() => empty)
      : Promise.resolve(null),
    createAdminClient().databases
      .listDocuments(DATABASE_ID, COLLECTIONS.RATINGS, [
        Query.equal('user_id', profile.id),
        Query.orderDesc('$updatedAt'),
        Query.limit(100),
      ])
      .catch(() => empty),
    createAdminClient().databases
      .listDocuments(DATABASE_ID, COLLECTIONS.COMMENTS, [
        Query.equal('user_id', profile.id),
        Query.orderDesc('$createdAt'),
        Query.limit(50),
      ])
      .catch(() => empty),
  ]);

  // Resolver items para favoritos, ratings y actividad en paralelo
  const ratingItemIds = ratingsResult.documents.map((r) => r.item_id as string);
  const commentItemIds = [...new Set(commentsResult.documents.map((c) => c.item_id as string))];

  const [favItems, ratingItemsArr, commentItemsArr] = await Promise.all([
    favResult ? getItemsByIds(favResult.documents.map((f) => f.item_id as string)).catch(() => []) : [],
    getItemsByIds(ratingItemIds).catch(() => []),
    getItemsByIds(commentItemIds).catch(() => []),
  ]);

  const ratingItemsMap = new Map(ratingItemsArr.map((i) => [i.id, i]));
  const commentItemsMap = new Map(commentItemsArr.map((i) => [i.id, i]));

  const ratings: RatingEntry[] = ratingsResult.documents
    .filter((r) => ratingItemsMap.has(r.item_id as string))
    .map((r) => ({
      score: r.score as number,
      updatedAt: r.$updatedAt,
      item: ratingItemsMap.get(r.item_id as string)!,
    }));

  const comments: ActivityComment[] = commentsResult.documents.map((c) => ({
    id: c.$id,
    content: c.content as string,
    createdAt: c.$createdAt,
    item: commentItemsMap.get(c.item_id as string) ?? null,
  }));

  const initials = (profile.display_name || profile.username).slice(0, 2).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Cabecera del perfil */}
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <Avatar className="h-20 w-20 flex-shrink-0">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
            {profile.display_name && (
              <span className="text-muted-foreground">@{profile.username}</span>
            )}
          </div>
          {profile.bio && (
            <p className="text-muted-foreground mt-2 max-w-prose">{profile.bio}</p>
          )}

          <div className="flex gap-4 mt-3">
            {(isOwner || profile.favorites_public) && (
              <div>
                <span className="font-semibold">{favItems.length}</span>{' '}
                <span className="text-sm text-muted-foreground">favoritos</span>
              </div>
            )}
            <div>
              <span className="font-semibold">{ratings.length}</span>{' '}
              <span className="text-sm text-muted-foreground">ratings</span>
            </div>
          </div>

          {!profile.favorites_public && !isOwner && (
            <Badge variant="outline" className="mt-2">Favoritos privados</Badge>
          )}
        </div>

        {isOwner && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/perfil/editar">Editar perfil</Link>
          </Button>
        )}
      </div>

      {/* Tabs: Favoritos / Ratings / Actividad */}
      <PublicProfileTabs
        favItems={favItems}
        favoritesPublic={profile.favorites_public}
        isOwner={isOwner}
        ratings={ratings}
        comments={comments}
      />
    </div>
  );
}
