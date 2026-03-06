// Capa de caché de items en Appwrite
// Evita llamadas repetidas a APIs externas y permite
// que favoritos/comentarios/ratings referencien IDs estables

import { Query } from 'node-appwrite';
import { createAdminClient } from '@/lib/appwrite/server';
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';
import type { Category, ExternalItem, Item } from '@/types';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

// El ID de documento se deriva del category + external_id para lookups O(1)
function docId(category: Category, externalId: string): string {
  return `${category}_${externalId}`;
}

function isFresh(cachedAt: string): boolean {
  return Date.now() - new Date(cachedAt).getTime() < CACHE_TTL_MS;
}

function mapDoc(doc: Record<string, unknown>): Item {
  return {
    id: doc.$id as string,
    external_id: doc.external_id as string,
    category: doc.category as Category,
    title: doc.title as string,
    description: (doc.description as string) || null,
    cover_url: (doc.cover_url as string) || null,
    genres: (doc.genres as string[]) || [],
    year: (doc.year as number) || null,
    external_data: doc.external_data ? JSON.parse(doc.external_data as string) : null,
    cached_at: doc.cached_at as string,
    created_at: doc.$createdAt as string,
    avg_rating: (doc.avg_rating as number) || 0,
    rating_count: (doc.rating_count as number) || 0,
    favorite_count: (doc.favorite_count as number) || 0,
  };
}

function externalToData(external: ExternalItem) {
  return {
    external_id: external.external_id,
    category: external.category,
    title: external.title,
    description: external.description,
    cover_url: external.cover_url,
    genres: external.genres,
    year: external.year,
    // Appwrite no tiene JSONB nativo → serializar como string
    external_data: JSON.stringify(external.external_data),
    cached_at: new Date().toISOString(),
  };
}

/**
 * Obtiene un item de la caché local o lo crea/actualiza desde la API externa.
 */
export async function getOrCacheItem(
  externalId: string,
  category: Category,
  apiFetcher: () => Promise<ExternalItem | null>
): Promise<Item | null> {
  const { databases } = createAdminClient();
  const id = docId(category, externalId);

  // 1. Buscar en caché
  try {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.ITEMS, id);
    if (isFresh(doc.cached_at as string)) {
      return mapDoc(doc as Record<string, unknown>);
    }
  } catch {
    // No existe en caché → continuar
  }

  // 2. Llamar a la API externa
  const external = await apiFetcher();
  if (!external) return null;

  const data = externalToData(external);

  // 3. Crear o actualizar (sin sobreescribir stats)
  try {
    const existing = await databases.getDocument(DATABASE_ID, COLLECTIONS.ITEMS, id);
    const updated = await databases.updateDocument(DATABASE_ID, COLLECTIONS.ITEMS, id, {
      ...data,
      // Preservar stats existentes
      avg_rating: existing.avg_rating,
      rating_count: existing.rating_count,
      favorite_count: existing.favorite_count,
    });
    return mapDoc(updated as Record<string, unknown>);
  } catch {
    // Crear documento nuevo
    try {
      const created = await databases.createDocument(DATABASE_ID, COLLECTIONS.ITEMS, id, {
        ...data,
        avg_rating: 0,
        rating_count: 0,
        favorite_count: 0,
      });
      return mapDoc(created as Record<string, unknown>);
    } catch (e) {
      console.error('[cache/items] Error al crear item:', e);
      return null;
    }
  }
}

/**
 * Guarda en caché una lista de items externos (para páginas de búsqueda).
 * No sobreescribe stats si ya existen.
 */
export async function cacheItems(externals: ExternalItem[]): Promise<void> {
  if (externals.length === 0) return;
  const { databases } = createAdminClient();

  await Promise.allSettled(
    externals.map(async (external) => {
      const id = docId(external.category, external.external_id);
      const data = externalToData(external);

      try {
        const existing = await databases.getDocument(DATABASE_ID, COLLECTIONS.ITEMS, id);
        if (!isFresh(existing.cached_at as string)) {
          await databases.updateDocument(DATABASE_ID, COLLECTIONS.ITEMS, id, {
            ...data,
            avg_rating: existing.avg_rating,
            rating_count: existing.rating_count,
            favorite_count: existing.favorite_count,
          });
        }
      } catch {
        await databases.createDocument(DATABASE_ID, COLLECTIONS.ITEMS, id, {
          ...data,
          avg_rating: 0,
          rating_count: 0,
          favorite_count: 0,
        });
      }
    })
  );
}

/**
 * Obtiene múltiples items de la caché por sus IDs locales de Appwrite.
 */
export async function getItemsByIds(ids: string[]): Promise<Item[]> {
  if (ids.length === 0) return [];
  const { databases } = createAdminClient();

  try {
    const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ITEMS, [
      Query.equal('$id', ids),
    ]);
    return result.documents.map((doc) => mapDoc(doc as Record<string, unknown>));
  } catch (e) {
    console.error('[cache/items] Error al obtener items por IDs:', e);
    return [];
  }
}

/**
 * Obtiene items de la caché por sus IDs derivados (category_externalId).
 * Útil para merge en páginas de búsqueda.
 */
export async function getCachedItemsByExternalIds(
  category: Category,
  externalIds: string[]
): Promise<Map<string, Item>> {
  if (externalIds.length === 0) return new Map();
  const { databases } = createAdminClient();

  const ids = externalIds.map((eid) => docId(category, eid));

  try {
    const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ITEMS, [
      Query.equal('$id', ids),
    ]);
    const map = new Map<string, Item>();
    for (const doc of result.documents) {
      map.set(doc.external_id as string, mapDoc(doc as Record<string, unknown>));
    }
    return map;
  } catch {
    return new Map();
  }
}
