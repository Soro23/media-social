'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { updateProfileAction, changeUsernameAction } from '@/app/actions/profile';
import type { Profile } from '@/types';

interface ProfileEditFormProps {
  profile: Profile;
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUsernamePending, startUsernameTrans] = useTransition();

  function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateProfileAction(formData);
      if (result.success) {
        toast.success('Perfil actualizado');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleUsernameSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startUsernameTrans(async () => {
      const result = await changeUsernameAction(formData);
      if (result.success) {
        toast.success('Nombre de usuario cambiado. Ya no podrás cambiarlo de nuevo.');
        router.refresh();
        router.push(`/perfil/${formData.get('username') as string}`);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-6 max-w-xl">
      {/* Editar perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Información del perfil</CardTitle>
          <CardDescription>Personaliza cómo te ven otros usuarios</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Nombre para mostrar</Label>
              <Input
                id="display_name"
                name="display_name"
                defaultValue={profile.display_name || ''}
                placeholder="Tu nombre"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografía</Label>
              <textarea
                id="bio"
                name="bio"
                defaultValue={profile.bio || ''}
                placeholder="Cuéntanos algo sobre ti..."
                rows={3}
                maxLength={300}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            <div className="flex items-center justify-between py-2 border rounded-lg px-4">
              <div>
                <p className="text-sm font-medium">Favoritos públicos</p>
                <p className="text-xs text-muted-foreground">Otros usuarios pueden ver tu lista</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="favorites_public"
                  value="true"
                  defaultChecked={profile.favorites_public}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            {/* Truco: incluir valor "false" oculto para cuando el checkbox no está marcado */}
            <input type="hidden" name="favorites_public" value="false" />

            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Cambiar username */}
      {!profile.username_locked && (
        <Card>
          <CardHeader>
            <CardTitle>Nombre de usuario</CardTitle>
            <CardDescription>
              Puedes cambiarlo una sola vez. Actualmente: <strong>@{profile.username}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nuevo username</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="nuevo_username"
                  minLength={3}
                  maxLength={20}
                  pattern="^[a-zA-Z0-9_]+$"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  3-20 caracteres. Solo letras, números y guión bajo.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ⚠️ Esta acción es irreversible. Una vez cambiado, no podrás volver a modificarlo.
                </p>
              </div>

              <Button type="submit" variant="outline" disabled={isUsernamePending}>
                {isUsernamePending ? 'Cambiando...' : 'Cambiar username'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {profile.username_locked && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Tu nombre de usuario es <strong>@{profile.username}</strong> y ya no puede ser cambiado.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
