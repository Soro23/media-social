'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { registerAction } from '@/app/actions/auth';
import { GoogleButton } from './GoogleButton';
import { Sparkles } from 'lucide-react';

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
    <div className="w-full max-w-sm mx-auto">
      {/* Brand header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/30">
          <Sparkles className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Unete a la comunidad</h1>
        <p className="text-muted-foreground text-sm mt-1">Crea tu cuenta de MediaSocial gratis</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
        <GoogleButton />

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">o con email</span>
          <Separator className="flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-sm font-medium">Nombre de usuario</Label>
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
              className="h-10"
            />
            <p className="text-xs text-muted-foreground">
              3-20 caracteres. Solo letras, números y guión bajo.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              autoComplete="email"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
              autoComplete="new-password"
              className="h-10"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-10 font-semibold shadow-sm shadow-primary/20" disabled={isPending}>
            {isPending ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Al registrarte aceptas nuestros{' '}
            <Link href="/terminos" className="text-primary hover:underline">términos de uso</Link>
            {' '}y{' '}
            <Link href="/privacidad" className="text-primary hover:underline">política de privacidad</Link>.
          </p>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-5">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
