import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createSessionClient, createAdminClient } from '@/lib/appwrite/server';
import { DATABASE_ID, COLLECTIONS } from '@/lib/appwrite/config';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import type { Profile } from '@/types';

export const metadata: Metadata = {
  title: 'Editar perfil',
};

export default async function EditProfilePage() {
  let userId: string | null = null;
  try {
    const { account } = await createSessionClient();
    userId = (await account.get()).$id;
  } catch {
    redirect('/login?redirect=/perfil/editar');
  }

  if (!userId) redirect('/login?redirect=/perfil/editar');

  const { databases } = createAdminClient();
  let profile: Profile | null = null;
  try {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROFILES, userId);
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
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar perfil</h1>
      <ProfileEditForm profile={profile!} />
    </div>
  );
}
