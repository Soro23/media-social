'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { loginAction } from '@/app/actions/auth';
import { GoogleButton } from './GoogleButton';
import { Sparkles } from 'lucide-react';

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result.success) {
        toast.success('¡Bienvenido!');
        window.location.href = redirectTo || '/';
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
        <h1 className="text-2xl font-bold tracking-tight">Bienvenido de nuevo</h1>
        <p className="text-muted-foreground text-sm mt-1">Entra a tu cuenta de MediaSocial</p>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
              <Link href="/recuperar-contrasena" className="text-xs text-primary hover:underline">
                ¿Olvidaste la contraseña?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="h-10"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-10 font-semibold shadow-sm shadow-primary/20" disabled={isPending}>
            {isPending ? 'Entrando...' : 'Iniciar sesión'}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-5">
        ¿No tienes cuenta?{' '}
        <Link href="/registro" className="text-primary hover:underline font-medium">
          Registrarse
        </Link>
      </p>
    </div>
  );
}
