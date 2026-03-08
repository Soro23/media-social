import Link from 'next/link';
import { Zap, BookMarked, BookOpen, Film, Tv, ArrowRight, Star, Heart, MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MediaSocial — Tu comunidad de entretenimiento',
};

const CATEGORIES = [
  {
    href: '/anime',
    label: 'Anime',
    description: 'Series de todos los géneros',
    icon: Zap,
    gradient: 'from-violet-900 via-violet-800 to-purple-700',
    glow: 'group-hover:shadow-violet-800/50',
    accent: 'bg-violet-400/20',
  },
  {
    href: '/manga',
    label: 'Manga',
    description: 'El mejor manga japonés',
    icon: BookMarked,
    gradient: 'from-rose-900 via-rose-800 to-pink-700',
    glow: 'group-hover:shadow-rose-800/50',
    accent: 'bg-rose-400/20',
  },
  {
    href: '/libros',
    label: 'Libros',
    description: 'Millones de títulos',
    icon: BookOpen,
    gradient: 'from-sky-900 via-sky-800 to-blue-700',
    glow: 'group-hover:shadow-sky-800/50',
    accent: 'bg-sky-400/20',
  },
  {
    href: '/peliculas',
    label: 'Películas',
    description: 'Cine de todo el mundo',
    icon: Film,
    gradient: 'from-slate-800 via-slate-700 to-zinc-700',
    glow: 'group-hover:shadow-slate-700/50',
    accent: 'bg-slate-400/20',
  },
  {
    href: '/series',
    label: 'Series',
    description: 'Series que no podrás parar',
    icon: Tv,
    gradient: 'from-emerald-900 via-emerald-800 to-teal-700',
    glow: 'group-hover:shadow-emerald-800/50',
    accent: 'bg-emerald-400/20',
  },
];

const FEATURES = [
  {
    icon: Star,
    title: 'Puntúa',
    description: 'Valora del 1 al 10 cualquier título y construye tu historial de ratings.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  {
    icon: Heart,
    title: 'Guarda favoritos',
    description: 'Crea tu lista personal. Accede a tus títulos favoritos desde cualquier lugar.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
  {
    icon: MessageCircle,
    title: 'Opina',
    description: 'Comenta y descubre qué piensa la comunidad sobre cada título.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-28">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative -mx-4 overflow-hidden">
        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute top-1/2 -left-20 h-80 w-80 rounded-full bg-primary/8 blur-3xl -translate-y-1/2" />
          <div className="absolute -bottom-20 right-1/4 h-64 w-96 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-24 sm:py-32 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-10 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Anime · Manga · Libros · Películas · Series
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-[0.92] mb-7">
            Descubre.<br />
            <span className="text-primary">Colecciona.</span><br />
            Comparte.
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed mb-12">
            Tu comunidad de entretenimiento. Guarda favoritos, puntúa contenido
            y comenta con gente que comparte tus gustos.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/anime"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/35 hover:bg-primary/90 hover:-translate-y-0.5 transition-all duration-200"
            >
              Explorar ahora
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 backdrop-blur-sm px-7 py-3.5 text-sm font-bold text-foreground hover:border-primary/50 hover:text-primary hover:-translate-y-0.5 transition-all duration-200"
            >
              Crear cuenta gratis
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-10 mt-16">
            {[
              { value: '5', label: 'categorías' },
              { value: '∞', label: 'títulos' },
              { value: '0€', label: 'para siempre' },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-10">
                {i > 0 && <div className="h-10 w-px bg-border" />}
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-3xl font-black text-foreground tracking-tight">{stat.value}</span>
                  <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categorías ───────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Explora</p>
            <h2 className="text-3xl font-black tracking-tight">Todo el entretenimiento</h2>
          </div>
          <span className="text-sm text-muted-foreground pb-1">5 categorías</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CATEGORIES.map(({ href, label, description, icon: Icon, gradient, glow, accent }) => (
            <Link
              key={href}
              href={href}
              className={`group relative h-48 md:h-64 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${glow}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
              {/* Shine */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,_transparent_60%)]" />
              {/* Bottom fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <div className={`w-10 h-10 rounded-xl ${accent} backdrop-blur-sm flex items-center justify-center`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white/55 text-xs mb-1 leading-snug hidden md:block">{description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-lg leading-tight">{label}</span>
                    <ArrowRight className="h-4 w-4 text-white/50 group-hover:translate-x-1 transition-transform duration-200" />
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
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Funciones</p>
          <h2 className="text-3xl font-black tracking-tight">¿Qué puedes hacer?</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">Todo lo que necesitas para llevar el control de lo que consumes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, description, color, bg }) => (
            <div
              key={title}
              className="group relative rounded-2xl border border-border bg-card p-7 hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/8 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-primary p-10 sm:p-16 text-center">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-black/15 blur-2xl" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-white/20" />
        </div>

        <div className="relative space-y-5">
          <p className="text-primary-foreground/60 text-xs font-bold uppercase tracking-widest">Empieza hoy</p>
          <h2 className="text-3xl sm:text-5xl font-black text-primary-foreground tracking-tight leading-tight">
            Únete a la comunidad
          </h2>
          <p className="text-primary-foreground/70 max-w-md mx-auto leading-relaxed">
            Crea tu cuenta gratis y empieza a explorar miles de títulos, guardar favoritos y compartir tu opinión.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Link
              href="/registro"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-foreground px-7 py-3.5 text-sm font-bold text-primary shadow-xl hover:bg-primary-foreground/90 hover:-translate-y-0.5 transition-all duration-200"
            >
              Registrarse gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/25 bg-primary-foreground/10 backdrop-blur-sm px-7 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/20 hover:-translate-y-0.5 transition-all duration-200"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
