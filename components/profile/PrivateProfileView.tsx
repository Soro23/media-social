import Link from 'next/link';
import { CalendarDays, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
      {/* Vista previa — cómo te ven otros */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 flex-shrink-0">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl font-bold leading-tight">
                  {profile.display_name || profile.username}
                </span>
                {profile.display_name && (
                  <span className="text-sm text-muted-foreground">@{profile.username}</span>
                )}
              </div>
              {!profile.display_name && (
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              )}
              {profile.bio && (
                <p className="text-sm text-muted-foreground leading-relaxed">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Miembro desde {joinedDate}
                </span>
                {!profile.favorites_public && (
                  <Badge variant="outline" className="text-xs">Favoritos privados</Badge>
                )}
              </div>

              <div className="flex gap-4 pt-1">
                <div className="text-center">
                  <p className="text-base font-semibold leading-none">{favCount}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Favoritos</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold leading-none">{ratingCount}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Ratings</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-3">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground -ml-2">
              <Link href={`/perfil/${profile.username}`}>
                <ExternalLink className="h-3.5 w-3.5" />
                Ver perfil público
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Formularios de edición */}
      <ProfileEditForm profile={profile} />
    </div>
  );
}
