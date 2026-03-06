import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Query } from 'node-appwrite';
import { createAdminClient } from '@/lib/appwrite/server';
import { SESSION_COOKIE, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';

function generateUsername(): string {
  const rand = Math.random().toString(36).slice(2, 7);
  return `usuario_${rand}`;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const userId = searchParams.get('userId');
  const secret = searchParams.get('secret');

  if (!userId || !secret) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  try {
    const { account, databases, users } = createAdminClient();
    const session = await account.createSession(userId, secret);

    // Crear perfil si es el primer login con Google
    try {
      await databases.getDocument(DATABASE_ID, COLLECTIONS.PROFILES, userId);
    } catch {
      let username = generateUsername();
      let attempts = 0;
      while (attempts < 5) {
        const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PROFILES, [
          Query.equal('username', username),
          Query.limit(1),
        ]);
        if (existing.total === 0) break;
        username = generateUsername();
        attempts++;
      }

      // Usar users (admin) en lugar de account.get() para evitar error de scope
      const user = await users.get(userId);
      await databases.createDocument(DATABASE_ID, COLLECTIONS.PROFILES, userId, {
        username,
        display_name: user.name || null,
        bio: null,
        avatar_url: null,
        favorites_public: true,
        username_locked: false,
      });
    }

    const response = NextResponse.redirect(`${origin}/`);
    response.cookies.set(SESSION_COOKIE, session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(session.expire),
      path: '/',
    });

    return response;
  } catch (e) {
    console.error('[auth/callback]', e);
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }
}
