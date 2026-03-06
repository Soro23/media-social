'use server';

import { z } from 'zod';
import { Query } from 'node-appwrite';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';
import type { ActionResult } from '@/types';

// ---- Background: propagar nuevo username a todos los comentarios ----

const COMMENTS_PAGE_SIZE = 100;  // máximo por petición a Appwrite
const COMMENTS_CONCURRENCY = 10; // updates simultáneos por página

async function propagateUsernameToComments(userId: string, newUsername: string): Promise<void> {
  let cursor: string | undefined;

  for (;;) {
    const queries = [
      Query.equal('user_id', userId),
      Query.limit(COMMENTS_PAGE_SIZE),
      ...(cursor ? [Query.cursorAfter(cursor)] : []),
    ];

    const result = await createAdminClient().databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.COMMENTS,
      queries,
    );

    if (result.documents.length === 0) break;

    // Actualizar en chunks para no saturar la API
    for (let i = 0; i < result.documents.length; i += COMMENTS_CONCURRENCY) {
      const chunk = result.documents.slice(i, i + COMMENTS_CONCURRENCY);
      await Promise.all(
        chunk.map((doc) =>
          createAdminClient().databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.COMMENTS,
            doc.$id,
            { username: newUsername },
          ),
        ),
      );
    }

    if (result.documents.length < COMMENTS_PAGE_SIZE) break;
    cursor = result.documents.at(-1)!.$id;
  }
}

const UpdateProfileSchema = z.object({
  display_name: z.string().max(50).optional(),
  bio: z.string().max(300).optional(),
  avatar_url: z.string().url('URL de avatar inválida').max(500).nullable().optional(),
  favorites_public: z.enum(['true', 'false']).transform((v) => v === 'true'),
});

const ChangeUsernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guión bajo'),
});

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  let user;
  try {
    const { account } = await createSessionClient();
    user = await account.get();
  } catch {
    return { success: false, error: 'No autorizado' };
  }

  const avatarUrlRaw = (formData.get('avatar_url') as string)?.trim();
  const raw = {
    display_name: (formData.get('display_name') as string) || undefined,
    bio: (formData.get('bio') as string) || undefined,
    avatar_url: avatarUrlRaw || null,
    favorites_public: formData.get('favorites_public') as string,
  };

  const parsed = UpdateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const { databases } = createAdminClient();
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, user.$id, {
      display_name: parsed.data.display_name || null,
      bio: parsed.data.bio || null,
      avatar_url: parsed.data.avatar_url ?? null,
      favorites_public: parsed.data.favorites_public,
    });
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: 'Error al actualizar el perfil' };
  }
}

export async function changeUsernameAction(formData: FormData): Promise<ActionResult> {
  let user;
  try {
    const { account } = await createSessionClient();
    user = await account.get();
  } catch {
    return { success: false, error: 'No autorizado' };
  }

  const { databases } = createAdminClient();

  const profile = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROFILES, user.$id);
  if (profile.username_locked) {
    return { success: false, error: 'Tu nombre de usuario ya no se puede cambiar' };
  }

  const raw = { username: (formData.get('username') as string)?.toLowerCase() };
  const parsed = ChangeUsernameSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Verificar unicidad
  const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
    Query.equal('username', parsed.data.username),
    Query.notEqual('$id', user.$id),
    Query.limit(1),
  ]);

  if (existing.total > 0) {
    return { success: false, error: 'Ese nombre de usuario ya está en uso' };
  }

  try {
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.PROFILES, user.$id, {
      username: parsed.data.username,
      username_locked: true,
    });
  } catch {
    return { success: false, error: 'Error al cambiar el nombre de usuario' };
  }

  // Propagar a comentarios en background — no bloquea la respuesta
  propagateUsernameToComments(user.$id, parsed.data.username).catch((err) => {
    console.error('[profile/username] Error propagando username en comentarios:', err);
  });

  return { success: true, data: undefined };
}
