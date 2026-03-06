// Wrapper para Open Library API
// Docs: https://openlibrary.org/dev/docs/api
// Sin API key requerida

import type { ExternalItem, Genre, SearchResult } from '@/types';

const BASE_URL = 'https://openlibrary.org';
const COVER_BASE = 'https://covers.openlibrary.org/b/id';
const REVALIDATE = 3600;

// Géneros principales de libros (en español)
export const BOOK_GENRES: Genre[] = [
  { id: 'fantasy', name: 'Fantasía' },
  { id: 'science_fiction', name: 'Ciencia Ficción' },
  { id: 'mystery', name: 'Misterio' },
  { id: 'thriller', name: 'Thriller' },
  { id: 'romance', name: 'Romance' },
  { id: 'horror', name: 'Horror' },
  { id: 'historical_fiction', name: 'Ficción Histórica' },
  { id: 'adventure', name: 'Aventura' },
  { id: 'biography', name: 'Biografía' },
  { id: 'history', name: 'Historia' },
  { id: 'graphic_novels', name: 'Novela Gráfica' },
  { id: 'young_adult', name: 'Juvenil' },
];

function normalizeBook(data: Record<string, unknown>): ExternalItem {
  const coverId = data.cover_i as number | undefined;
  const coverUrl = coverId ? `${COVER_BASE}/${coverId}-L.jpg` : null;

  // Open Library devuelve el año de primera publicación
  const firstPublishYear = data.first_publish_year as number | null | undefined;

  // Subjects como géneros
  const subjects = (data.subject as string[]) || [];
  const genres = subjects.slice(0, 5); // Limitar a 5 para no saturar

  return {
    external_id: (data.key as string).replace('/works/', ''),
    category: 'libro',
    title: data.title as string,
    description: null, // El API de búsqueda no devuelve descripción
    cover_url: coverUrl,
    genres,
    year: firstPublishYear || null,
    external_data: data,
  };
}

function normalizeBookDetail(data: Record<string, unknown>, workId: string): ExternalItem {
  const coverId = (data.covers as number[] | undefined)?.[0];
  const coverUrl = coverId ? `${COVER_BASE}/${coverId}-L.jpg` : null;

  const descriptionRaw = data.description as string | { value: string } | undefined;
  const description =
    typeof descriptionRaw === 'string'
      ? descriptionRaw
      : descriptionRaw?.value || null;

  const subjects = (data.subjects as string[]) || [];
  const genres = subjects.slice(0, 5);

  // El año viene del endpoint de ediciones
  return {
    external_id: workId,
    category: 'libro',
    title: data.title as string,
    description,
    cover_url: coverUrl,
    genres,
    year: null,
    external_data: data,
  };
}

export async function searchBooks(params: {
  query?: string;
  genre?: string;
  page?: number;
}): Promise<SearchResult> {
  const limit = 24;
  const page = params.page || 1;
  const offset = (page - 1) * limit;

  let url: string;

  if (params.query) {
    url = `${BASE_URL}/search.json?q=${encodeURIComponent(params.query)}&fields=key,title,cover_i,first_publish_year,subject&limit=${limit}&offset=${offset}`;
  } else if (params.genre) {
    url = `${BASE_URL}/subjects/${encodeURIComponent(params.genre)}.json?limit=${limit}&offset=${offset}`;
  } else {
    // Trending: libros populares en Inglés y Español
    url = `${BASE_URL}/search.json?q=popular&fields=key,title,cover_i,first_publish_year,subject&sort=rating&limit=${limit}&offset=${offset}`;
  }

  const res = await fetch(url, {
    next: { revalidate: REVALIDATE },
  });

  if (!res.ok) throw new Error(`Open Library API error: ${res.status}`);

  const json = (await res.json()) as {
    docs?: Record<string, unknown>[];
    works?: Record<string, unknown>[];
    numFound?: number;
    work_count?: number;
  };

  const docs = json.docs || json.works || [];
  const total = json.numFound || json.work_count || docs.length;

  return {
    items: docs.map(normalizeBook),
    total,
    page,
    has_next_page: offset + limit < total,
  };
}

export async function getBookById(id: string): Promise<ExternalItem | null> {
  const res = await fetch(`${BASE_URL}/works/${id}.json`, {
    next: { revalidate: REVALIDATE },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Open Library API error: ${res.status}`);

  const json = (await res.json()) as Record<string, unknown>;
  return normalizeBookDetail(json, id);
}

export async function getBookGenres(): Promise<Genre[]> {
  return BOOK_GENRES;
}
