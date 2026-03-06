-- ============================================================
-- Media Social - Schema SQL para Supabase
-- Ejecutar en el SQL Editor del dashboard de Supabase
-- ============================================================

-- Habilitar extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: profiles
-- Extiende auth.users con datos del perfil público
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio          TEXT,
  avatar_url   TEXT,
  favorites_public  BOOLEAN NOT NULL DEFAULT TRUE,
  username_locked   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT username_length CHECK (char_length(username) BETWEEN 3 AND 20),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$')
);

-- Trigger: actualiza updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: crea perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  generated_username TEXT;
BEGIN
  -- Para social login, generar username temporal si no hay metadata
  generated_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    'usuario_' || SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 8)
  );

  INSERT INTO public.profiles (id, username, display_name, avatar_url, username_locked)
  VALUES (
    NEW.id,
    generated_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    -- Si el username viene del metadata del usuario (registro email), no está bloqueado
    -- Si es auto-generado (social login), tampoco está bloqueado aún (se bloquea al cambiarlo)
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TABLA: items
-- Caché local de items de APIs externas (Jikan, TMDB, OpenLibrary)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id  TEXT NOT NULL,
  category     TEXT NOT NULL CHECK (category IN ('anime', 'manga', 'libro', 'pelicula', 'serie')),
  title        TEXT NOT NULL,
  description  TEXT,
  cover_url    TEXT,
  genres       TEXT[] NOT NULL DEFAULT '{}',
  year         INTEGER,
  external_data JSONB,
  cached_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT items_external_unique UNIQUE (external_id, category)
);

-- ============================================================
-- TABLA: favorites
-- Items guardados por usuarios
-- ============================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id    UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT favorites_unique UNIQUE (user_id, item_id)
);

-- ============================================================
-- TABLA: comments
-- Comentarios de usuarios en items
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id    UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT comment_content_length CHECK (char_length(content) BETWEEN 1 AND 2000)
);

CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- TABLA: comment_reports
-- Reportes de moderación básica
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comment_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment_id  UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT report_unique UNIQUE (reporter_id, comment_id)
);

-- ============================================================
-- TABLA: ratings
-- Puntuaciones 1-10 por usuario/item
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ratings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id    UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  score      SMALLINT NOT NULL CHECK (score >= 1 AND score <= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT ratings_unique UNIQUE (user_id, item_id)
);

CREATE TRIGGER ratings_updated_at
  BEFORE UPDATE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- ÍNDICES para rendimiento
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_items_category        ON public.items(category);
CREATE INDEX IF NOT EXISTS idx_items_external        ON public.items(external_id, category);
CREATE INDEX IF NOT EXISTS idx_items_genres          ON public.items USING GIN(genres);
CREATE INDEX IF NOT EXISTS idx_favorites_user        ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_item        ON public.favorites(item_id);
CREATE INDEX IF NOT EXISTS idx_comments_item         ON public.comments(item_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user         ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_item          ON public.ratings(item_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user          ON public.ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_comment       ON public.comment_reports(comment_id);

-- ============================================================
-- VISTA: items_with_stats
-- Items con media de puntuación y conteo de favoritos
-- ============================================================
CREATE OR REPLACE VIEW public.items_with_stats AS
SELECT
  i.*,
  COALESCE(ROUND(AVG(r.score), 1), 0) AS avg_rating,
  COUNT(DISTINCT r.id)                 AS rating_count,
  COUNT(DISTINCT f.id)                 AS favorite_count
FROM public.items i
LEFT JOIN public.ratings  r ON r.item_id = i.id
LEFT JOIN public.favorites f ON f.item_id = i.id
GROUP BY i.id;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings         ENABLE ROW LEVEL SECURITY;

-- --- PROFILES ---
-- Cualquiera puede leer perfiles públicos
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (TRUE);

-- El usuario solo puede actualizar su propio perfil
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Inserción gestionada por el trigger handle_new_user (SECURITY DEFINER)
-- No se permite inserción directa

-- --- ITEMS ---
-- Cualquiera puede leer items (caché pública)
CREATE POLICY "items_select_all" ON public.items
  FOR SELECT USING (TRUE);

-- Solo usuarios autenticados pueden insertar/actualizar items (caché)
CREATE POLICY "items_upsert_authenticated" ON public.items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "items_update_authenticated" ON public.items
  FOR UPDATE USING (auth.role() = 'authenticated');

-- --- FAVORITES ---
-- Un usuario solo ve sus propios favoritos
-- EXCEPCIÓN: si el perfil tiene favorites_public = TRUE, cualquiera puede verlos
CREATE POLICY "favorites_select" ON public.favorites
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_id AND p.favorites_public = TRUE
    )
  );

CREATE POLICY "favorites_insert_own" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_delete_own" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- --- COMMENTS ---
-- Cualquiera puede leer comentarios
CREATE POLICY "comments_select_all" ON public.comments
  FOR SELECT USING (TRUE);

-- Solo el autor puede insertar comentarios (auth requerida)
CREATE POLICY "comments_insert_own" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Solo el autor puede actualizar su comentario
CREATE POLICY "comments_update_own" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Solo el autor puede borrar su comentario
CREATE POLICY "comments_delete_own" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- --- COMMENT REPORTS ---
-- El reportador solo ve sus propios reportes
CREATE POLICY "reports_select_own" ON public.comment_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Cualquier usuario autenticado puede reportar
CREATE POLICY "reports_insert_auth" ON public.comment_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- --- RATINGS ---
-- Cualquiera puede leer puntuaciones
CREATE POLICY "ratings_select_all" ON public.ratings
  FOR SELECT USING (TRUE);

-- Solo el autor puede insertar/actualizar su puntuación
CREATE POLICY "ratings_insert_own" ON public.ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ratings_update_own" ON public.ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ratings_delete_own" ON public.ratings
  FOR DELETE USING (auth.uid() = user_id);
