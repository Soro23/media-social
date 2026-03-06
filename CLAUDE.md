# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint (v9 flat config via eslint.config.mjs)
```

No test suite is configured.

## Architecture

Media-Social is a Spanish-language social platform for tracking anime, manga, movies, TV series, and books. Built with **Next.js 16 App Router**, **Appwrite** as the backend, and **Tailwind CSS v4 + shadcn/ui**.

### Route Groups

- `app/(auth)/` — Login, register, password recovery pages (unauthenticated layout)
- `app/(main)/` — All main app pages (navbar layout), including category browse pages (`/anime`, `/manga`, `/peliculas`, `/series`, `/libros`) and detail pages (`/[category]/[id]`), favorites, and profile

### External APIs → Appwrite Cache → Stable IDs

Items from external APIs are cached in Appwrite with a **24-hour TTL**. This caching is essential because favorites, ratings, and comments reference stable Appwrite document IDs.

**Item document ID format:** `{category}_{external_id}` (e.g., `anime_21`, `pelicula_550`)

External API wrappers in `lib/api/`:
- `jikan.ts` — Jikan v4 (MyAnimeList) for anime and manga. No API key needed; rate-limited to 3 req/s.
- `tmdb.ts` — TMDB for movies (`pelicula`) and series (`serie`). Requires `TMDB_API_KEY`.
- `openlibrary.ts` — Open Library for books (`libro`).

All wrappers normalize data to the `ExternalItem` type. Cache operations are in `lib/cache/items.ts` (`getOrCacheItem`, `cacheItems`, `getItemsByIds`, `getCachedItemsByExternalIds`).

### Appwrite Backend

**Database:** `media-social`
**Collections:** `profiles`, `items`, `favorites`, `comments`, `comment_reports`, `ratings`

Two Appwrite client factories in `lib/appwrite/server.ts`:
- `createSessionClient()` — async, reads session cookie, acts as the authenticated user
- `createAdminClient()` — sync, uses `APPWRITE_API_KEY`, full admin access (server-only)

Stats (`avg_rating`, `rating_count`, `favorite_count`) are denormalized directly into `items` documents and updated on every mutation.

### Authentication

Email/password and Google OAuth via Appwrite. Session stored as HttpOnly cookie `appwrite-session`. OAuth callback handled by `app/auth/callback/route.ts`, which creates a profile document if it's a first-time Google login.

### Server Actions

All mutations are Next.js Server Actions in `app/actions/`:
- `auth.ts` — login, register, Google OAuth, logout, password reset
- `social.ts` — toggle favorite, add/delete comment, report comment, upsert rating
- `profile.ts` — edit profile

All actions return `ActionResult<T>` (`{ success: true; data: T } | { success: false; error: string }`).

Comment content is sanitized server-side with `isomorphic-dompurify` (strips all HTML tags). Rate limiting on comments: max 10 per minute per user.

### Key Types

Defined in `types/index.ts`:
- `Category` — `'anime' | 'manga' | 'libro' | 'pelicula' | 'serie'`
- `ExternalItem` — normalized shape from external APIs
- `Item` — cached Appwrite document with stats
- `CommentWithProfile` — comment with denormalized username and avatar

### Component Structure

- `components/ui/` — shadcn/ui primitives (button, card, dialog, etc.)
- `components/auth/` — LoginForm, RegisterForm, GoogleButton
- `components/items/` — ItemCard, ItemGrid, SearchBar, GenreFilter, Pagination, RatingWidget
- `components/favorites/` — FavoriteButton
- `components/comments/` — CommentForm, CommentList
- `components/profile/` — ProfileEditForm
- `components/layout/` — Navbar

### Environment Variables

```
NEXT_PUBLIC_APPWRITE_ENDPOINT    # Appwrite endpoint URL
NEXT_PUBLIC_APPWRITE_PROJECT_ID  # Appwrite project ID
APPWRITE_API_KEY                 # Appwrite admin API key (server-only)
TMDB_API_KEY                     # TMDB v3 API key (server-only)
NEXT_PUBLIC_APP_URL              # Full app URL, used for OAuth redirect URIs
```

## Agentes

### @feature-builder
Implementa features completas end-to-end: Server Action + componente + tipos.
- Usa siempre el patrón `ActionResult<T>` para retornos
- `createSessionClient()` para mutaciones autenticadas, nunca `createAdminClient()` en acciones de usuario
- Actualiza stats denormalizados (`avg_rating`, `rating_count`, `favorite_count`) en el documento `items` en cada mutación
- Coloca Server Actions en `app/actions/`, componentes en `components/` bajo su subcarpeta correspondiente
- Valida inputs con Zod antes de cualquier operación en Appwrite

### @api-integrator
Integra nuevas fuentes de datos externas siguiendo el patrón establecido.
- Normaliza siempre a `ExternalItem` (ver `types/index.ts`)
- Crea el wrapper en `lib/api/{nombre}.ts`
- Registra caché en `lib/cache/items.ts` con TTL 24h usando `getOrCacheItem`
- ID format obligatorio: `{category}_{external_id}` (e.g. `juego_123`)
- Añade la nueva `Category` en `types/index.ts` si es categoría nueva
- Maneja errores de red con fallback graceful, nunca lanza excepciones sin capturar

### @ui-component
Crea y modifica componentes visuales consistentes con el diseño existente.
- Usa exclusivamente shadcn/ui + Tailwind v4, sin librerías de estilos adicionales
- Respeta la estructura de `components/`: subcarpeta por dominio (items, auth, profile, etc.)
- Componentes de servidor por defecto; añade `"use client"` solo si hay interactividad real
- Acepta y propaga `className` para composabilidad
- Usa `next/image` para cualquier imagen externa, configurando el dominio en `next.config`

### @auth-guard
Audita y refuerza la seguridad de la aplicación.
- Verifica que `createAdminClient()` solo se usa en contextos server-only, nunca en Client Components
- Confirma que `APPWRITE_API_KEY` no aparece en ningún bundle del cliente
- Revisa que todas las Server Actions verifican sesión antes de cualquier operación
- Comprueba sanitización con `isomorphic-dompurify` en todos los inputs de usuario
- Valida que el rate limiting de comentarios (10/min) no es bypasseable
- Revisa flags de cookies: HttpOnly, Secure, SameSite

### @performance
Detecta y elimina cuellos de botella en APIs externas y Appwrite.
- Implementa queue para Jikan respetando el límite estricto de 3 req/s
- Detecta N+1 queries a Appwrite y propone batching con `getItemsByIds`
- Evalúa si el TTL de 24h es adecuado por categoría y propone ajustes
- Propone ISR o `revalidate` en páginas de detalle cuando aplique
- Audita bundle size con `@next/bundle-analyzer` antes de sugerir nuevas dependencias

### @test-writer
Configura y expande la suite de tests del proyecto.
- Stack: Jest + Testing Library + `jest-mock-extended` para Appwrite
- Patrón obligatorio: `makeDatabases()` en `beforeEach` para estado limpio entre tests
- Mockea `createSessionClient`/`createAdminClient` intercambiables según el caso
- Usa `mockResolvedValueOnce` chains para secuencias de llamadas a BD
- Cubre mínimo: auth guard, validación de inputs, caminos happy/sad, y casos límite (floor-at-zero, duplicados)
- Para `isomorphic-dompurify` usa `__esModule: true` en el mock por el `import()` dinámico

### @debugger
Recibe un error y aplica el fix mínimo necesario.
- Input esperado: mensaje de error + stack trace + archivo afectado
- Localiza la causa raíz antes de tocar código
- Aplica únicamente el cambio necesario, sin refactorizar código no relacionado
- Verifica que el fix no rompe los tests existentes
- Responde con: causa en una línea + diff del cambio aplicado