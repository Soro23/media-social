// Wrapper para Google Books API
// Docs: https://developers.google.com/books/docs/v1/reference/volumes/list
// API key opcional (GOOGLE_BOOKS_API_KEY) — sin ella funciona con rate limit reducido
// Usado como fuente secundaria de descripción para libros

const BASE_URL = 'https://www.googleapis.com/books/v1';
const REVALIDATE = 3600;

/**
 * Busca un libro por título en Google Books y devuelve su descripción.
 * Aplica langRestrict=es para priorizar ediciones en español.
 * Devuelve null si no hay resultado o hay error (no lanza excepción).
 */
export async function fetchGoogleBooksDescription(title: string): Promise<string | null> {
  try {
    const url = new URL(`${BASE_URL}/volumes`);
    url.searchParams.set('q', title);
    url.searchParams.set('maxResults', '3');
    url.searchParams.set('langRestrict', 'es');
    url.searchParams.set('printType', 'books');

    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    if (apiKey) url.searchParams.set('key', apiKey);

    const res = await fetch(url.toString(), { next: { revalidate: REVALIDATE } });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      items?: Array<{ volumeInfo?: { description?: string; title?: string } }>;
    };

    if (!json.items?.length) return null;

    // Buscar el item cuyo título coincida mejor; si ninguno, usar el primero con descripción
    const titleLower = title.toLowerCase();
    const best =
      json.items.find(
        (item) =>
          item.volumeInfo?.description &&
          item.volumeInfo.title?.toLowerCase().includes(titleLower),
      ) || json.items.find((item) => item.volumeInfo?.description);

    return best?.volumeInfo?.description || null;
  } catch {
    return null;
  }
}

/**
 * Busca un libro por título sin restricción de idioma.
 * Fallback final cuando langRestrict=es no devuelve descripción.
 */
export async function fetchGoogleBooksDescriptionAny(title: string): Promise<string | null> {
  try {
    const url = new URL(`${BASE_URL}/volumes`);
    url.searchParams.set('q', title);
    url.searchParams.set('maxResults', '1');
    url.searchParams.set('printType', 'books');

    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    if (apiKey) url.searchParams.set('key', apiKey);

    const res = await fetch(url.toString(), { next: { revalidate: REVALIDATE } });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      items?: Array<{ volumeInfo?: { description?: string } }>;
    };

    return json.items?.[0]?.volumeInfo?.description || null;
  } catch {
    return null;
  }
}
