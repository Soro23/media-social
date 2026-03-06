import Link from 'next/link';
import { CalendarDays, ExternalLink, Lock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import type { Profile } from '@/types';

interface PrivateProfileViewProps {
  profile: Profile;
  favCount: number;
  ratingCount: number;
}

export function PrivateProfileView({ profile, favCount, ratingCount }: PrivateProfileViewProps) {
  const initials = (profile.display_name || profile.username).slice(0, 2).toUpperCase();
  const joinedDate = new Date(profile.created_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="max-w-xl space-y-6">
      {/* Profile preview card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Gradient header strip */}
        <div className="h-20 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent" />

        <div className="px-6 pb-6">
          {/* Avatar overlapping the strip */}
          <div className="-mt-10 mb-4 flex items-end justify-between">
            <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" asChild className="mb-1 text-xs">
              <Link href={`/perfil/${profile.username}`} className="flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                Ver perfil público
              </Link>
            </Button>
          </div>

          {/* Name & username */}
          <div className="space-y-0.5 mb-3">
            <h2 className="text-xl font-bold leading-tight">
              {profile.display_name || profile.username}
            </h2>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{profile.bio}</p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-5 mb-4">
            <div>
              <span className="text-lg font-bold">{favCount}</span>
              <span className="text-xs text-muted-foreground ml-1.5">Favoritos</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div>
              <span className="text-lg font-bold">{ratingCount}</span>
              <span className="text-xs text-muted-foreground ml-1.5">Ratings</span>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              Miembro desde {joinedDate}
            </span>
            {!profile.favorites_public && (
              <span className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" />
                Favoritos privados
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <ProfileEditForm profile={profile} />
    </div>
  );
}
