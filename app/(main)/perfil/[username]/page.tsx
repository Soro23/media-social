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
import type { Category, Item, Profile } from '@/types';

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

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

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;
  const { databases } = createAdminClient();

  const profilesResult = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
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

  let favItems: Item[] = [];
  if (isOwner || profile.favorites_public) {
    const favResult = await databases.listDocuments(DATABASE_ID, COLLECTIONS.FAVORITES, [
      Query.equal('user_id', profile.id),
      Query.orderDesc('$createdAt'),
      Query.limit(250),
    ]);
    favItems = await getItemsByIds(favResult.documents.map((f) => f.item_id as string));
  }

  const initials = (profile.display_name || profile.username).slice(0, 2).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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
          {profile.bio && <p className="text-muted-foreground mt-2 max-w-prose">{profile.bio}</p>}
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

      {(isOwner || profile.favorites_public) ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Favoritos <span className="text-muted-foreground font-normal text-base">({favItems.length})</span>
          </h2>

          {favItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {isOwner ? 'Aún no tienes favoritos guardados' : 'No hay favoritos para mostrar'}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favItems.map((item) => (
                <Link key={item.id} href={`${CATEGORY_PATHS[item.category]}/${item.external_id}`} className="group">
                  <div className="space-y-2">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                      {item.cover_url ? (
                        <Image
                          src={item.cover_url}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 50vw, 20vw"
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">Sin imagen</div>
                      )}
                    </div>
                    <p className="text-xs font-medium line-clamp-2 group-hover:text-primary transition-colors">{item.title}</p>
                    <Badge variant="outline" className="text-xs">{CATEGORY_LABELS[item.category]}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground border rounded-xl">
          <p>Este usuario tiene sus favoritos en privado</p>
        </div>
      )}
    </div>
  );
}
