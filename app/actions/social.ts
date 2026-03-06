'use server';

import { z } from 'zod';
import { ID, Query, AppwriteException } from 'node-appwrite';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';
import type { ActionResult } from '@/types';

// ---- Helpers ----

async function getCurrentUser() {
  try {
    const { account } = await createSessionClient();
    return await account.get();
  } catch {
    return null;
  }
}

async function getUserProfile(userId: string) {
  try {
    const { databases } = createAdminClient();
    return await databases.getDocument(DATABASE_ID, COLLECTIONS.PROFILES, userId);
  } catch {
    return null;
  }
}

// ---- Rate limiting básico ----

async function checkCommentRateLimit(userId: string): Promise<boolean> {
  const { databases } = createAdminClient();
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();

  const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.COMMENTS, [
    Query.equal('user_id', userId),
    Query.greaterThanEqual('$createdAt', oneMinuteAgo),
    Query.limit(10),
  ]);

  return result.total < 10;
}

// ---- Favoritos ----

export async function toggleFavoriteAction(itemId: string): Promise<ActionResult<{ isFavorite: boolean }>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Debes iniciar sesión para guardar favoritos' };
  }

  const { databases } = createAdminClient();

  const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.FAVORITES, [
    Query.equal('user_id', user.$id),
    Query.equal('item_id', itemId),
    Query.limit(1),
  ]);

  if (existing.total > 0) {
    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.FAVORITES, existing.documents[0].$id);

    try {
      const item = await databases.getDocument(DATABASE_ID, COLLECTIONS.ITEMS, itemId);
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.ITEMS, itemId, {
        favorite_count: Math.max(0, ((item.favorite_count as number) || 0) - 1),
      });
    } catch { /* item puede no existir */ }

    return { success: true, data: { isFavorite: false } };
  } else {
    await databases.createDocument(DATABASE_ID, COLLECTIONS.FAVORITES, ID.unique(), {
      user_id: user.$id,
      item_id: itemId,
    });

    try {
      const item = await databases.getDocument(DATABASE_ID, COLLECTIONS.ITEMS, itemId);
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.ITEMS, itemId, {
        favorite_count: ((item.favorite_count as number) || 0) + 1,
      });
    } catch { /* item puede no existir */ }

    return { success: true, data: { isFavorite: true } };
  }
}

// ---- Comentarios ----

const CommentSchema = z.object({
  content: z
    .string()
    .min(1, 'El comentario no puede estar vacío')
    .max(2000, 'El comentario no puede superar 2000 caracteres'),
  itemId: z.string().min(1, 'ID de item inválido'),
});

export async function addCommentAction(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Debes iniciar sesión para comentar' };
  }

  const raw = {
    content: (formData.get('content') as string)?.trim(),
    itemId: formData.get('itemId') as string,
  };

  const parsed = CommentSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const withinLimit = await checkCommentRateLimit(user.$id);
  if (!withinLimit) {
    return { success: false, error: 'Estás comentando demasiado rápido. Espera un momento.' };
  }

  const { default: DOMPurify } = await import('isomorphic-dompurify');
  const sanitized = DOMPurify.sanitize(parsed.data.content, { ALLOWED_TAGS: [] });

  const profile = await getUserProfile(user.$id);
  const username = (profile?.username as string) || 'usuario';
  const avatarUrl = (profile?.avatar_url as string) || null;

  const { databases } = createAdminClient();

  try {
    const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.COMMENTS, ID.unique(), {
      user_id: user.$id,
      item_id: parsed.data.itemId,
      content: sanitized,
      username,
      avatar_url: avatarUrl,
    });

    try {
      const item = await databases.getDocument(DATABASE_ID, COLLECTIONS.ITEMS, parsed.data.itemId);
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.ITEMS, parsed.data.itemId, {
        comment_count: ((item.comment_count as number) || 0) + 1,
      });
    } catch { /* item puede no existir */ }

    return { success: true, data: { id: doc.$id } };
  } catch {
    return { success: false, error: 'Error al publicar el comentario' };
  }
}

export async function deleteCommentAction(commentId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const { databases } = createAdminClient();

  let comment;
  try {
    comment = await databases.getDocument(DATABASE_ID, COLLECTIONS.COMMENTS, commentId);
  } catch {
    return { success: false, error: 'Comentario no encontrado' };
  }

  if (comment.user_id !== user.$id) {
    return { success: false, error: 'No autorizado' };
  }

  await databases.deleteDocument(DATABASE_ID, COLLECTIONS.COMMENTS, commentId);

  try {
    const itemId = comment.item_id as string;
    const item = await databases.getDocument(DATABASE_ID, COLLECTIONS.ITEMS, itemId);
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.ITEMS, itemId, {
      comment_count: Math.max(0, ((item.comment_count as number) || 0) - 1),
    });
  } catch { /* item puede no existir */ }

  return { success: true, data: undefined };
}

// ---- Reportes ----

const ReportSchema = z.object({
  commentId: z.string().min(1),
  reason: z.string().max(500).optional(),
});

export async function reportCommentAction(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Debes iniciar sesión para reportar' };
  }

  const raw = {
    commentId: formData.get('commentId') as string,
    reason: (formData.get('reason') as string) || undefined,
  };

  const parsed = ReportSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: 'Datos inválidos' };
  }

  const { databases } = createAdminClient();

  const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.COMMENT_REPORTS, [
    Query.equal('reporter_id', user.$id),
    Query.equal('comment_id', parsed.data.commentId),
    Query.limit(1),
  ]);

  if (existing.total > 0) {
    return { success: false, error: 'Ya has reportado este comentario' };
  }

  try {
    await databases.createDocument(DATABASE_ID, COLLECTIONS.COMMENT_REPORTS, ID.unique(), {
      reporter_id: user.$id,
      comment_id: parsed.data.commentId,
      reason: parsed.data.reason || null,
    });
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: 'Error al enviar el reporte' };
  }
}

// ---- Ratings ----

const RatingSchema = z.object({
  itemId: z.string().min(1),
  score: z.coerce.number().int().min(1).max(10),
});

export async function upsertRatingAction(formData: FormData): Promise<ActionResult<{ score: number }>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Debes iniciar sesión para puntuar' };
  }

  const raw = {
    itemId: formData.get('itemId') as string,
    score: formData.get('score'),
  };

  const parsed = RatingSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: 'Puntuación inválida (1-10)' };
  }

  const { databases } = createAdminClient();

  const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.RATINGS, [
    Query.equal('user_id', user.$id),
    Query.equal('item_id', parsed.data.itemId),
    Query.limit(1),
  ]);

  try {
    if (existing.total > 0) {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.RATINGS, existing.documents[0].$id, {
        score: parsed.data.score,
      });
    } else {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.RATINGS, ID.unique(), {
        user_id: user.$id,
        item_id: parsed.data.itemId,
        score: parsed.data.score,
      });
    }

    // Recalcular media y count en el item
    const allRatings = await databases.listDocuments(DATABASE_ID, COLLECTIONS.RATINGS, [
      Query.equal('item_id', parsed.data.itemId),
      Query.limit(5000),
    ]);

    const total = allRatings.total;
    const sum = allRatings.documents.reduce((acc, r) => acc + (r.score as number), 0);
    const avg = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;

    await databases.updateDocument(DATABASE_ID, COLLECTIONS.ITEMS, parsed.data.itemId, {
      avg_rating: avg,
      rating_count: total,
    });

    return { success: true, data: { score: parsed.data.score } };
  } catch (e) {
    const err = e as AppwriteException;
    console.error('[social/rating]', err.message);
    return { success: false, error: 'Error al guardar la puntuación' };
  }
}
