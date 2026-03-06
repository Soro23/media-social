// Wrapper para Jikan API v4 (MyAnimeList)
// Docs: https://docs.api.jikan.moe/
// Sin API key requerida | Rate limit: 3 req/s, 60 req/min

import type { ExternalItem, Genre, SearchResult } from '@/types';

const BASE_URL = 'https://api.jikan.moe/v4';

// Cache de 1 hora para resultados de búsqueda
const REVALIDATE = 3600;

// ----- Helpers -----

function normalizeAnime(data: Record<string, unknown>): ExternalItem {
  const images = data.images as Record<string, Record<string, string>> | undefined;
  return {
    external_id: String(data.mal_id),
    category: 'anime',
    title: (data.title_spanish as string) || (data.title as string),
    description: (data.synopsis as string) || null,
    cover_url: images?.jpg?.large_image_url || images?.jpg?.image_url || null,
    genres: ((data.genres as Array<{ name: string }>) || []).map((g) => g.name),
    year: (data.year as number) || (data.aired as { prop?: { from?: { year?: number } } })?.prop?.from?.year || null,
    external_data: data,
  };
}

function normalizeManga(data: Record<string, unknown>): ExternalItem {
  const images = data.images as Record<string, Record<string, string>> | undefined;
  return {
    external_id: String(data.mal_id),
    category: 'manga',
    title: (data.title_spanish as string) || (data.title as string),
    description: (data.synopsis as string) || null,
    cover_url: images?.jpg?.large_image_url || images?.jpg?.image_url || null,
    genres: ((data.genres as Array<{ name: string }>) || []).map((g) => g.name),
    year: (data.published as { prop?: { from?: { year?: number } } })?.prop?.from?.year || null,
    external_data: data,
  };
}

// ----- Anime -----

export async function searchAnime(params: {
  query?: string;
  genre?: string;
  page?: number;
}): Promise<SearchResult> {
  const url = new URL(`${BASE_URL}/anime`);
  if (params.query) url.searchParams.set('q', params.query);
  if (params.genre) url.searchParams.set('genres', params.genre);
  if (params.page) url.searchParams.set('page', String(params.page));
  url.searchParams.set('limit', '24');
  url.searchParams.set('order_by', 'popularity');
  url.searchParams.set('sfw', 'true');

  const res = await fetch(url.toString(), {
    next: { revalidate: REVALIDATE },
  });

  if (!res.ok) throw new Error(`Jikan API error: ${res.status}`);

  const json = (await res.json()) as {
    data: Record<string, unknown>[];
    pagination: { last_visible_page: number; has_next_page: boolean; items: { total: number } };
  };

  return {
    items: json.data.map(normalizeAnime),
    total: json.pagination.items.total,
    page: params.page || 1,
    has_next_page: json.pagination.has_next_page,
  };
}

export async function getAnimeById(id: string): Promise<ExternalItem | null> {
  const res = await fetch(`${BASE_URL}/anime/${id}`, {
    next: { revalidate: REVALIDATE },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Jikan API error: ${res.status}`);

  const json = (await res.json()) as { data: Record<string, unknown> };
  return normalizeAnime(json.data);
}

export async function getAnimeGenres(): Promise<Genre[]> {
  const res = await fetch(`${BASE_URL}/genres/anime`, {
    next: { revalidate: 86400 }, // 24 horas
  });

  if (!res.ok) return [];

  const json = (await res.json()) as { data: Array<{ mal_id: number; name: string }> };
  return json.data.map((g) => ({ id: g.mal_id, name: g.name }));
}

// ----- Manga -----

export async function searchManga(params: {
  query?: string;
  genre?: string;
  page?: number;
}): Promise<SearchResult> {
  const url = new URL(`${BASE_URL}/manga`);
  if (params.query) url.searchParams.set('q', params.query);
  if (params.genre) url.searchParams.set('genres', params.genre);
  if (params.page) url.searchParams.set('page', String(params.page));
  url.searchParams.set('limit', '24');
  url.searchParams.set('order_by', 'popularity');
  url.searchParams.set('sfw', 'true');

  const res = await fetch(url.toString(), {
    next: { revalidate: REVALIDATE },
  });

  if (!res.ok) throw new Error(`Jikan API error: ${res.status}`);

  const json = (await res.json()) as {
    data: Record<string, unknown>[];
    pagination: { has_next_page: boolean; items: { total: number } };
  };

  return {
    items: json.data.map(normalizeManga),
    total: json.pagination.items.total,
    page: params.page || 1,
    has_next_page: json.pagination.has_next_page,
  };
}

export async function getMangaById(id: string): Promise<ExternalItem | null> {
  const res = await fetch(`${BASE_URL}/manga/${id}`, {
    next: { revalidate: REVALIDATE },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Jikan API error: ${res.status}`);

  const json = (await res.json()) as { data: Record<string, unknown> };
  return normalizeManga(json.data);
}

export async function getMangaGenres(): Promise<Genre[]> {
  const res = await fetch(`${BASE_URL}/genres/manga`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) return [];

  const json = (await res.json()) as { data: Array<{ mal_id: number; name: string }> };
  return json.data.map((g) => ({ id: g.mal_id, name: g.name }));
}
