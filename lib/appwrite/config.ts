// Configuración central de Appwrite
export const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
export const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;

// Nombre de la cookie de sesión (HttpOnly)
export const SESSION_COOKIE = 'appwrite-session';

// IDs de la base de datos y colecciones
export const DATABASE_ID = 'media-social';

export const COLLECTIONS = {
  PROFILES: 'profiles',
  ITEMS: 'items',
  FAVORITES: 'favorites',
  COMMENTS: 'comments',
  COMMENT_REPORTS: 'comment_reports',
  RATINGS: 'ratings',
} as const;
