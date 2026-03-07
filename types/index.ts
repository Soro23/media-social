// ============================================================
// Tipos compartidos para toda la aplicación
// ============================================================

export type Category = 'anime' | 'manga' | 'libro' | 'pelicula' | 'serie';

// -------------------------------------------------------
// Entidades de la base de datos
// -------------------------------------------------------

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  favorites_public: boolean;
  username_locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  external_id: string;
  category: Category;
  title: string;
  description: string | null;
  cover_url: string | null;
  genres: string[];
  year: number | null;
  external_data: Record<string, unknown> | null;
  cached_at: string;
  created_at: string;
  // Stats stored directly in item document
  avg_rating: number;
  rating_count: number;
  favorite_count: number;
}

export interface Favorite {
  id: string;
  user_id: string;
  item_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  item_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommentWithProfile extends Comment {
  // Denormalized fields stored directly in comment document
  username: string;
  avatar_url: string | null;
  // Kept for backwards compatibility with CommentList
  profiles: Pick<Profile, 'username' | 'display_name' | 'avatar_url'>;
}

export interface CommentReport {
  id: string;
  reporter_id: string;
  comment_id: string;
  reason: string | null;
  created_at: string;
}

export interface Rating {
  id: string;
  user_id: string;
  item_id: string;
  score: number;
  created_at: string;
  updated_at: string;
}

// -------------------------------------------------------
// Datos de APIs externas (normalizados)
// -------------------------------------------------------

export interface ExternalItem {
  external_id: string;
  category: Category;
  title: string;
  description: string | null;
  cover_url: string | null;
  genres: string[];
  year: number | null;
  external_data: Record<string, unknown>;
}

// Respuesta de búsqueda de cualquier API
export interface SearchResult {
  items: ExternalItem[];
  total: number;
  page: number;
  has_next_page: boolean;
  total_pages?: number;
}

// Géneros disponibles por categoría
export interface Genre {
  id: string | number;
  name: string;
}

// -------------------------------------------------------
// Tipos para Server Actions (respuestas)
// -------------------------------------------------------

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
