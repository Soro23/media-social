'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, BookOpen, Film, Tv, BookMarked, Zap, Heart, User, LogOut, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { signOutAction } from '@/app/actions/auth';
import { ThemeToggle, ThemeToggleMobile } from '@/components/layout/ThemeToggle';
import type { Profile } from '@/types';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/anime', label: 'Anime', icon: Zap },
  { href: '/manga', label: 'Manga', icon: BookMarked },
  { href: '/libros', label: 'Libros', icon: BookOpen },
  { href: '/peliculas', label: 'Películas', icon: Film },
  { href: '/series', label: 'Series', icon: Tv },
];

interface NavbarProps {
  profile: Profile | null;
}

export function Navbar({ profile }: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await signOutAction();
  }

  const initials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : profile?.username?.slice(0, 2).toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-15 items-center justify-between px-4 gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            <span className="text-primary">Media</span>
            <span className="text-foreground">Social</span>
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className={cn('h-3.5 w-3.5', active && 'text-primary')} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Acciones derecha */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden md:flex">
            <ThemeToggle />
          </div>
          {profile ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative hidden md:flex h-9 w-9 rounded-full p-0 ring-2 ring-border hover:ring-primary/50 transition-all">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold leading-none">{profile.display_name || profile.username}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">@{profile.username}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/favoritos" className="flex items-center gap-2.5 cursor-pointer">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    Mis favoritos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/perfil/${profile.username}`} className="flex items-center gap-2.5 cursor-pointer">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Mi perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2.5 text-destructive focus:text-destructive cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                <Link href="/login">Entrar</Link>
              </Button>
              <Button size="sm" asChild className="shadow-sm">
                <Link href="/registro">Registrarse</Link>
              </Button>
            </div>
          )}

          {/* Menú móvil */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex flex-col h-full">
                {/* Header móvil */}
                <div className="flex items-center gap-2 px-4 h-15 border-b border-border/50">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                    <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-base">
                    <span className="text-primary">Media</span>
                    <span>Social</span>
                  </span>
                </div>

                <nav className="flex flex-col gap-0.5 p-3">
                  {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                    const active = pathname.startsWith(href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                          active
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="border-t border-border/50">
                  <ThemeToggleMobile />
                </div>
                <div className="border-t border-border/50 p-3">
                  {profile ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium leading-none">{profile.display_name || profile.username}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">@{profile.username}</p>
                        </div>
                      </div>
                      <Link
                        href="/favoritos"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                      >
                        <Heart className="h-4 w-4" />
                        Mis favoritos
                      </Link>
                      <Link
                        href={`/perfil/${profile.username}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                      >
                        <User className="h-4 w-4" />
                        Mi perfil
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-all text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" asChild className="w-full" onClick={() => setMobileOpen(false)}>
                        <Link href="/login">Entrar</Link>
                      </Button>
                      <Button asChild className="w-full" onClick={() => setMobileOpen(false)}>
                        <Link href="/registro">Registrarse</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
