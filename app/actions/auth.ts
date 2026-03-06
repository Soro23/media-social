'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { ID, OAuthProvider, AppwriteException, Query } from 'node-appwrite';
import { createAdminClient, createSessionClient } from '@/lib/appwrite/server';
import { SESSION_COOKIE, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';
import type { ActionResult } from '@/types';

// ---- Esquemas ----

const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  username: z
    .string()
    .min(3, 'El username debe tener al menos 3 caracteres')
    .max(20, 'El username no puede superar 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guión bajo'),
});

const ResetSchema = z.object({
  email: z.string().email('Email inválido'),
});

// ---- Helpers ----

async function setSessionCookie(secret: string, expire: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(expire),
    path: '/',
  });
}

// ---- Actions ----

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const { account } = createAdminClient();
    const session = await account.createEmailPasswordSession(
      parsed.data.email,
      parsed.data.password
    );
    await setSessionCookie(session.secret, session.expire);
    return { success: true, data: undefined };
  } catch (e) {
    const err = e as AppwriteException;
    if (err.code === 401) {
      return { success: false, error: 'Email o contraseña incorrectos' };
    }
    return { success: false, error: 'Error al iniciar sesión' };
  }
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    username: formData.get('username') as string,
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const username = parsed.data.username.toLowerCase();
  const { account, databases } = createAdminClient();

  // Verificar unicidad del username
  const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
    Query.equal('username', username),
    Query.limit(1),
  ]);
  if (existing.total > 0) {
    return { success: false, error: 'Ese username ya está en uso' };
  }

  try {
    const userId = ID.unique();
    await account.create(userId, parsed.data.email, parsed.data.password);

    // Crear perfil
    await databases.createDocument(DATABASE_ID, COLLECTIONS.PROFILES, userId, {
      username,
      display_name: null,
      bio: null,
      avatar_url: null,
      favorites_public: true,
      username_locked: false,
    });

    // Iniciar sesión automáticamente
    const session = await account.createEmailPasswordSession(
      parsed.data.email,
      parsed.data.password
    );
    await setSessionCookie(session.secret, session.expire);

    return { success: true, data: undefined };
  } catch (e) {
    const err = e as AppwriteException;
    if (err.code === 409) {
      return { success: false, error: 'Ese email ya está registrado' };
    }
    return { success: false, error: 'Error al crear la cuenta. Inténtalo de nuevo.' };
  }
}

export async function loginWithGoogleAction() {
  const { account } = createAdminClient();
  const oauthUrl = await account.createOAuth2Token(
    OAuthProvider.Google,
    `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    `${process.env.NEXT_PUBLIC_APP_URL}/login?error=oauth_failed`
  );
  redirect(oauthUrl);
}

export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  const raw = { email: formData.get('email') as string };
  const parsed = ResetSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const { account } = createAdminClient();
    await account.createRecovery(
      parsed.data.email,
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
    );
  } catch {
    // Silenciar para no revelar si el email existe
  }

  return { success: true, data: undefined };
}

export async function signOutAction() {
  try {
    const { account } = await createSessionClient();
    await account.deleteSession('current');
  } catch {
    // Sesión ya expirada
  }
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect('/');
}
