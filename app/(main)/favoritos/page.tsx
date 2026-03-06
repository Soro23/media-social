import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Query } from 'node-appwrite';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';
import { getItemsByIds } from '@/lib/cache/items';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Category, Item } from '@/types';

export const metadata: Metadata = {
  title: 'Mis favoritos',
};

const CATEGORY_LABELS: Record<Category, string> = {
  anime: 'Anime',
  manga: 'Manga',
  libro: 'Libros',
  pelicula: 'Películas',
  serie: 'Series',
};

const CATEGORY_PATHS: Record<Category, string> = {
  anime: '/anime',
  manga: '/manga',
  libro: '/libros',
  pelicula: '/peliculas',
  serie: '/series',
};

export default async function FavoritosPage() {
  let userId: string | null = null;
  try {
    const { account } = await createSessionClient();
    userId = (await account.get()).$id;
  } catch {
    redirect('/login?redirect=/favoritos');
  }

  if (!userId) redirect('/login?redirect=/favoritos');

  const { databases } = createAdminClient();

  const favoritesResult = await databases.listDocuments(DATABASE_ID, COLLECTIONS.FAVORITES, [
    Query.equal('user_id', userId),
    Query.orderDesc('$createdAt'),
    Query.limit(250),
  ]);

  const itemIds = favoritesResult.documents.map((f) => f.item_id as string);
  const allItems = await getItemsByIds(itemIds);

  const byCategory: Record<string, Item[]> = {
    todos: allItems,
    anime: allItems.filter((i) => i.category === 'anime'),
    manga: allItems.filter((i) => i.category === 'manga'),
    libro: allItems.filter((i) => i.category === 'libro'),
    pelicula: allItems.filter((i) => i.category === 'pelicula'),
    serie: allItems.filter((i) => i.category === 'serie'),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mis favoritos</h1>
        <p className="text-muted-foreground">
          {allItems.length} {allItems.length === 1 ? 'item guardado' : 'items guardados'}
        </p>
      </div>

      <Tabs defaultValue="todos">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="todos">Todos ({byCategory.todos.length})</TabsTrigger>
          {(['anime', 'manga', 'libro', 'pelicula', 'serie'] as Category[]).map((cat) =>
            byCategory[cat].length > 0 && (
              <TabsTrigger key={cat} value={cat}>
                {CATEGORY_LABELS[cat]} ({byCategory[cat].length})
              </TabsTrigger>
            )
          )}
        </TabsList>

        {(['todos', 'anime', 'manga', 'libro', 'pelicula', 'serie'] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6">
            {byCategory[tab].length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p>No tienes favoritos en esta categoría</p>
                {tab !== 'todos' && (
                  <Link
                    href={CATEGORY_PATHS[tab as Category]}
                    className="text-primary hover:underline text-sm mt-2 block"
                  >
                    Explorar {CATEGORY_LABELS[tab as Category]}
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {byCategory[tab].map((item) => (
                  <FavoriteItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function FavoriteItemCard({ item }: { item: Item }) {
  const path = `${CATEGORY_PATHS[item.category]}/${item.external_id}`;

  return (
    <Link href={path} className="group">
      <div className="space-y-2">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted shadow-sm group-hover:shadow-md transition-shadow">
          {item.cover_url ? (
            <Image
              src={item.cover_url}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 50vw, 20vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">Sin imagen</div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
            {item.title}
          </p>
          <Badge variant="outline" className="text-xs mt-1">
            {CATEGORY_LABELS[item.category]}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
