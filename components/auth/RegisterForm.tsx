'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { registerAction } from '@/app/actions/auth';
import { GoogleButton } from './GoogleButton';

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await registerAction(formData);
      if (result.success) {
        toast.success('¡Bienvenido a MediaSocial!');
        window.location.href = '/';
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Crear cuenta</CardTitle>
        <CardDescription>Únete a la comunidad de MediaSocial</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoogleButton />

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">o con email</span>
          <Separator className="flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nombre de usuario</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="mi_usuario"
              required
              minLength={3}
              maxLength={20}
              pattern="^[a-zA-Z0-9_]+$"
              autoComplete="username"
            />
            <p className="text-xs text-muted-foreground">
              3-20 caracteres. Solo letras, números y guión bajo.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Al registrarte aceptas nuestros{' '}
            <Link href="/terminos" className="underline">términos de uso</Link>
            {' '}y{' '}
            <Link href="/privacidad" className="underline">política de privacidad</Link>.
          </p>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Iniciar sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
