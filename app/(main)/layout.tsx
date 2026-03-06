import { Navbar } from '@/components/layout/Navbar';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';
import type { Profile } from '@/types';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let profile: Profile | null = null;

  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    const { databases } = createAdminClient();
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
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar profile={profile} />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-border/50 py-8 mt-12">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-primary">Media</span>
            <span>Social</span>
          </div>
          <p>© {new Date().getFullYear()} · Datos de Jikan, TMDB y Open Library</p>
        </div>
      </footer>
    </div>
  );
}
