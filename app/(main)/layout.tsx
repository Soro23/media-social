import { Navbar } from '@/components/layout/Navbar';
import { createSessionClient } from '@/lib/appwrite/server';
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';
import type { Profile } from '@/types';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let profile: Profile | null = null;

  try {
    const { account, databases } = await createSessionClient();
    const user = await account.get();

    const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROFILES, user.$id);
    profile = {
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
  } catch {
    // No autenticado o error de sesión
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar profile={profile} />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} MediaSocial · Datos de Jikan, TMDB y Open Library</p>
      </footer>
    </div>
  );
}
