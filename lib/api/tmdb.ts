// Wrapper para TMDB API (The Movie Database)
// Docs: https://developer.themoviedb.org/docs
// Requiere API key en TMDB_API_KEY

import type { ExternalItem, Genre, SearchResult } from '@/types';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const REVALIDATE = 3600; // 1 hora

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    accept: 'application/json',
  };
}

// ----- Helpers -----

function normalizeMovie(data: Record<string, unknown>, genreMap: Map<number, string>): ExternalItem {
  const posterPath = data.poster_path as string | null;
  const genreIds = (data.genre_ids as number[]) || [];
  const genreObjects = (data.genres as Array<{ id: number; name: string }>) || [];

  const genres =
    genreObjects.length > 0
      ? genreObjects.map((g) => g.name)
      : genreIds.map((id) => genreMap.get(id)).filter(Boolean) as string[];

  const releaseDate = (data.release_date as string) || '';
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  return {
    external_id: String(data.id),
    category: 'pelicula',
    title: (data.title as string) || (data.original_title as string),
    description: (data.overview as string) || null,
    cover_url: posterPath ? `${IMAGE_BASE}${posterPath}` : null,
    genres,
    year,
    external_data: data,
  };
}

function normalizeSerie(data: Record<string, unknown>, genreMap: Map<number, string>): ExternalItem {
  const posterPath = data.poster_path as string | null;
  const genreIds = (data.genre_ids as number[]) || [];
  const genreObjects = (data.genres as Array<{ id: number; name: string }>) || [];

  const genres =
    genreObjects.length > 0
      ? genreObjects.map((g) => g.name)
      : genreIds.map((id) => genreMap.get(id)).filter(Boolean) as string[];

  const firstAirDate = (data.first_air_date as string) || '';
  const year = firstAirDate ? new Date(firstAirDate).getFullYear() : null;

  return {
    external_id: String(data.id),
    category: 'serie',
    title: (data.name as string) || (data.original_name as string),
    description: (data.overview as string) || null,
    cover_url: posterPath ? `${IMAGE_BASE}${posterPath}` : null,
    genres,
    year,
    external_data: data,
  };
}

// ----- Géneros -----

async function fetchMovieGenreMap(): Promise<Map<number, string>> {
  const res = await fetch(`${BASE_URL}/genre/movie/list?language=es-ES`, {
    headers: getHeaders(),
    next: { revalidate: 86400 },
  });
  if (!res.ok) return new Map();
  const json = (await res.json()) as { genres: Array<{ id: number; name: string }> };
  return new Map(json.genres.map((g) => [g.id, g.name]));
}

async function fetchTVGenreMap(): Promise<Map<number, string>> {
  const res = await fetch(`${BASE_URL}/genre/tv/list?language=es-ES`, {
    headers: getHeaders(),
    next: { revalidate: 86400 },
  });
  if (!res.ok) return new Map();
  const json = (await res.json()) as { genres: Array<{ id: number; name: string }> };
  return new Map(json.genres.map((g) => [g.id, g.name]));
}

export async function getMovieGenres(): Promise<Genre[]> {
  const res = await fetch(`${BASE_URL}/genre/movie/list?language=es-ES`, {
    headers: getHeaders(),
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { genres: Array<{ id: number; name: string }> };
  return json.genres.map((g) => ({ id: g.id, name: g.name }));
}

export async function getTVGenres(): Promise<Genre[]> {
  const res = await fetch(`${BASE_URL}/genre/tv/list?language=es-ES`, {
    headers: getHeaders(),
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { genres: Array<{ id: number; name: string }> };
  return json.genres.map((g) => ({ id: g.id, name: g.name }));
}

// ----- Películas -----

export async function searchMovies(params: {
  query?: string;
  genreId?: string;
  page?: number;
}): Promise<SearchResult> {
  const genreMap = await fetchMovieGenreMap();
  let url: string;

  if (params.query) {
    url = `${BASE_URL}/search/movie?language=es-ES&query=${encodeURIComponent(params.query)}&page=${params.page || 1}`;
  } else {
    url = `${BASE_URL}/discover/movie?language=es-ES&sort_by=popularity.desc&page=${params.page || 1}`;
    if (params.genreId) url += `&with_genres=${params.genreId}`;
  }

  const res = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: REVALIDATE },
  });

  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);

  const json = (await res.json()) as {
    results: Record<string, unknown>[];
    total_results: number;
    total_pages: number;
    page: number;
  };

  return {
    items: json.results.map((item) => normalizeMovie(item, genreMap)),
    total: json.total_results,
    page: json.page,
    has_next_page: json.page < json.total_pages,
  };
}

export async function getMovieById(id: string): Promise<ExternalItem | null> {
  const res = await fetch(`${BASE_URL}/movie/${id}?language=es-ES`, {
    headers: getHeaders(),
    next: { revalidate: REVALIDATE },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);

  const json = (await res.json()) as Record<string, unknown>;
  return normalizeMovie(json, new Map());
}

// ----- Series -----

export async function searchSeries(params: {
  query?: string;
  genreId?: string;
  page?: number;
}): Promise<SearchResult> {
  const genreMap = await fetchTVGenreMap();
  let url: string;

  if (params.query) {
    url = `${BASE_URL}/search/tv?language=es-ES&query=${encodeURIComponent(params.query)}&page=${params.page || 1}`;
  } else {
    url = `${BASE_URL}/discover/tv?language=es-ES&sort_by=popularity.desc&page=${params.page || 1}`;
    if (params.genreId) url += `&with_genres=${params.genreId}`;
  }

  const res = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: REVALIDATE },
  });

  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);

  const json = (await res.json()) as {
    results: Record<string, unknown>[];
    total_results: number;
    total_pages: number;
    page: number;
  };

  return {
    items: json.results.map((item) => normalizeSerie(item, genreMap)),
    total: json.total_results,
    page: json.page,
    has_next_page: json.page < json.total_pages,
  };
}

export async function getSerieById(id: string): Promise<ExternalItem | null> {
  const res = await fetch(`${BASE_URL}/tv/${id}?language=es-ES`, {
    headers: getHeaders(),
    next: { revalidate: REVALIDATE },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);

  const json = (await res.json()) as Record<string, unknown>;
  return normalizeSerie(json, new Map());
}
