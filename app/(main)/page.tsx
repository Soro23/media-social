import Link from 'next/link';
import { Zap, BookMarked, BookOpen, Film, Tv, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inicio — Descubre anime, manga, libros, películas y series',
};

const CATEGORIES = [
  {
    href: '/anime',
    label: 'Anime',
    description: 'Descubre y comenta series anime de todos los géneros',
    icon: Zap,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
  },
  {
    href: '/manga',
    label: 'Manga',
    description: 'Explora el mundo del manga japonés',
    icon: BookMarked,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    href: '/libros',
    label: 'Libros',
    description: 'Comparte tus lecturas favoritas',
    icon: BookOpen,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
  },
  {
    href: '/peliculas',
    label: 'Películas',
    description: 'Películas de todo el mundo con reseñas',
    icon: Film,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    href: '/series',
    label: 'Series',
    description: 'Series de TV que enganchan',
    icon: Tv,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Tu comunidad de
          <span className="text-primary"> entretenimiento</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explora anime, manga, libros, películas y series. Guarda tus favoritos,
          puntúa y comenta con la comunidad.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button size="lg" asChild>
            <Link href="/anime">Explorar anime</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/registro">Crear cuenta</Link>
          </Button>
        </div>
      </section>

      {/* Categorías */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Explora por categoría</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map(({ href, label, description, icon: Icon, color, bg }) => (
            <Link key={href} href={href}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <CardTitle className="flex items-center justify-between">
                    {label}
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA para no autenticados */}
      <section className="bg-muted rounded-xl p-8 text-center space-y-4">
        <h2 className="text-2xl font-semibold">Únete a la comunidad</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Crea tu cuenta gratis para guardar favoritos, puntuar contenido y compartir
          tus opiniones con otros usuarios.
        </p>
        <Button asChild>
          <Link href="/registro">Registrarse gratis</Link>
        </Button>
      </section>
    </div>
  );
}
