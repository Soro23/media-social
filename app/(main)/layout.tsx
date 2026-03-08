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
      <main className="flex-1 container mx-auto px-4">
        {children}
      </main>
      <footer className="border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-black">M</span>
            </div>
            <span className="font-bold text-sm">
              <span className="text-primary">Media</span>Social
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} · Datos de{' '}
            <span className="font-medium">Jikan</span>,{' '}
            <span className="font-medium">TMDB</span> y{' '}
            <span className="font-medium">Open Library</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
