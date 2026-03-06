import Link from 'next/link';
import { Zap, BookMarked, BookOpen, Film, Tv, ArrowRight, Star, Heart, MessageCircle, Sparkles } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MediaSocial — Tu comunidad de entretenimiento',
};

const CATEGORIES = [
  {
    href: '/anime',
    label: 'Anime',
    description: 'Series anime de todos los géneros',
    icon: Zap,
    gradient: 'from-orange-800 via-orange-700 to-amber-600',
    glow: 'group-hover:shadow-orange-700/40',
  },
  {
    href: '/manga',
    label: 'Manga',
    description: 'El mejor manga japonés',
    icon: BookMarked,
    gradient: 'from-rose-900 via-red-800 to-rose-700',
    glow: 'group-hover:shadow-rose-800/40',
  },
  {
    href: '/libros',
    label: 'Libros',
    description: 'Millones de títulos',
    icon: BookOpen,
    gradient: 'from-amber-800 via-amber-700 to-yellow-600',
    glow: 'group-hover:shadow-amber-700/40',
  },
  {
    href: '/peliculas',
    label: 'Películas',
    description: 'Cine de todo el mundo',
    icon: Film,
    gradient: 'from-stone-800 via-orange-900 to-amber-800',
    glow: 'group-hover:shadow-stone-700/40',
  },
  {
    href: '/series',
    label: 'Series',
    description: 'Series que no podrás parar',
    icon: Tv,
    gradient: 'from-red-900 via-red-800 to-orange-700',
    glow: 'group-hover:shadow-red-800/40',
  },
];

const FEATURES = [
  {
    icon: Star,
    title: 'Puntúa',
    description: 'Valora del 1 al 10 cualquier título y construye tu historial de ratings.',
  },
  {
    icon: Heart,
    title: 'Guarda favoritos',
    description: 'Crea tu lista personal. Accede a tus títulos favoritos desde cualquier lugar.',
  },
  {
    icon: MessageCircle,
    title: 'Opina',
    description: 'Comenta y descubre qué piensa la comunidad sobre cada título.',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-24">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative -mx-4 overflow-hidden">
        {/* Warm background orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 h-[500px] w-[500px] rounded-full bg-primary/12 blur-3xl" />
          <div className="absolute top-1/2 left-0 h-72 w-72 rounded-full bg-amber-500/8 blur-3xl -translate-y-1/2 -translate-x-1/2" />
          <div className="absolute -bottom-16 right-1/3 h-64 w-64 rounded-full bg-primary/8 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-20 sm:py-28 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            Anime · Manga · Libros · Películas · Series
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.95] mb-6">
            Descubre.<br />
            <span className="text-primary">Colecciona.</span><br />
            Comparte.
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
            Tu comunidad de entretenimiento. Guarda favoritos, puntúa contenido
            y comenta con gente que comparte tus gustos.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/anime"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:-translate-y-0.5"
            >
              Explorar ahora
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-all hover:-translate-y-0.5"
            >
              Crear cuenta gratis
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-foreground">5</span>
              <span>categorías</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-foreground">∞</span>
              <span>títulos</span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-foreground">0€</span>
              <span>para siempre</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categorías ───────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-black tracking-tight">Explora</h2>
          <span className="text-sm text-muted-foreground">5 categorías</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CATEGORIES.map(({ href, label, description, icon: Icon, gradient, glow }) => (
            <Link
              key={href}
              href={href}
              className={`group relative h-44 md:h-64 rounded-2xl overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${glow}`}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />

              {/* Texture overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.08)_0%,_transparent_60%)]" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1 leading-snug hidden md:block">
                    {description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-lg leading-tight">{label}</span>
                    <ArrowRight className="h-4 w-4 text-white/60 translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tight">¿Qué puedes hacer?</h2>
          <p className="text-muted-foreground">Todo lo que necesitas para llevar el control de lo que consumes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="group relative rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-amber-600 p-10 sm:p-14 text-center">
        {/* Decorative */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/8 blur-2xl" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-black/15 blur-2xl" />
          <div className="absolute top-1/2 left-1/2 h-32 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-xl" />
        </div>

        <div className="relative space-y-5">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Únete a la comunidad
          </h2>
          <p className="text-white/75 max-w-md mx-auto leading-relaxed">
            Crea tu cuenta gratis y empieza a explorar miles de títulos, guardar
            favoritos y compartir tu opinión.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary shadow-lg hover:bg-white/90 transition-all hover:-translate-y-0.5"
            >
              Registrarse gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-all hover:-translate-y-0.5"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
