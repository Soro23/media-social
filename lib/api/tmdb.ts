// Wrapper para TMDB API (The Movie Database)
// Docs: https://developer.themoviedb.org/docs
// Requiere API key v3 en TMDB_API_KEY

import type { ExternalItem, Genre, SearchResult } from '@/types';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const REVALIDATE = 3600; // 1 hora

/** Construye URL con api_key y language ya incluidos */
function tmdbUrl(path: string, params: Record<string, string> = {}): string {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('api_key', process.env.TMDB_API_KEY ?? '');
  url.searchParams.set('language', 'es-ES');
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return url.toString();
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
  const res = await fetch(tmdbUrl('/genre/movie/list'), {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return new Map();
  const json = (await res.json()) as { genres: Array<{ id: number; name: string }> };
  return new Map(json.genres.map((g) => [g.id, g.name]));
}

async function fetchTVGenreMap(): Promise<Map<number, string>> {
  const res = await fetch(tmdbUrl('/genre/tv/list'), {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return new Map();
  const json = (await res.json()) as { genres: Array<{ id: number; name: string }> };
  return new Map(json.genres.map((g) => [g.id, g.name]));
}

export async function getMovieGenres(): Promise<Genre[]> {
  const res = await fetch(tmdbUrl('/genre/movie/list'), {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { genres: Array<{ id: number; name: string }> };
  return json.genres.map((g) => ({ id: g.id, name: g.name }));
}

export async function getTVGenres(): Promise<Genre[]> {
  const res = await fetch(tmdbUrl('/genre/tv/list'), {
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
  const page = String(params.page || 1);

  const url = params.query
    ? tmdbUrl('/search/movie', { query: params.query, page })
    : tmdbUrl('/discover/movie', {
        sort_by: 'popularity.desc',
        page,
        ...(params.genreId ? { with_genres: params.genreId } : {}),
      });

  const res = await fetch(url, { next: { revalidate: REVALIDATE } });
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
    total_pages: json.total_pages,
  };
}

function trimTMDBData(data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...data };

  if (result.credits && typeof result.credits === 'object') {
    const c = result.credits as { cast?: unknown[]; crew?: unknown[] };
    result.credits = {
      cast: (c.cast ?? []).slice(0, 15),
      crew: ((c.crew ?? []) as Array<{ job?: string }>)
        .filter((m) => ['Director', 'Creator', 'Screenplay', 'Writer', 'Executive Producer'].includes(m.job ?? ''))
        .slice(0, 8),
    };
  }

  if (result.similar && typeof result.similar === 'object') {
    const s = result.similar as { results?: unknown[] };
    result.similar = { results: (s.results ?? []).slice(0, 12) };
  }

  const providers = result['watch/providers'];
  if (providers && typeof providers === 'object') {
    const p = providers as { results?: Record<string, unknown> };
    result['watch/providers'] = {
      results: Object.fromEntries(
        Object.entries(p.results ?? {}).filter(([k]) => ['ES', 'US'].includes(k))
      ),
    };
  }

  return result;
}

export async function getMovieById(id: string): Promise<ExternalItem | null> {
  const res = await fetch(
    tmdbUrl(`/movie/${id}`, { append_to_response: 'credits,similar,watch/providers' }),
    { next: { revalidate: REVALIDATE } }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
  const json = (await res.json()) as Record<string, unknown>;
  const item = normalizeMovie(trimTMDBData(json), new Map());

  if (!item.description) {
    const url = new URL(`${BASE_URL}/movie/${id}`);
    url.searchParams.set('api_key', process.env.TMDB_API_KEY ?? '');
    url.searchParams.set('language', 'en-US');
    const fallback = await fetch(url.toString(), { next: { revalidate: REVALIDATE } });
    if (fallback.ok) {
      const fallbackJson = (await fallback.json()) as Record<string, unknown>;
      const overview = fallbackJson.overview as string | undefined;
      if (overview) return { ...item, description: overview };
    }
  }

  return item;
}

// ----- Series -----

export async function searchSeries(params: {
  query?: string;
  genreId?: string;
  page?: number;
}): Promise<SearchResult> {
  const genreMap = await fetchTVGenreMap();
  const page = String(params.page || 1);

  const url = params.query
    ? tmdbUrl('/search/tv', { query: params.query, page })
    : tmdbUrl('/discover/tv', {
        sort_by: 'popularity.desc',
        page,
        ...(params.genreId ? { with_genres: params.genreId } : {}),
      });

  const res = await fetch(url, { next: { revalidate: REVALIDATE } });
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
    total_pages: json.total_pages,
  };
}

export async function getSerieById(id: string): Promise<ExternalItem | null> {
  const res = await fetch(
    tmdbUrl(`/tv/${id}`, { append_to_response: 'credits,similar,watch/providers' }),
    { next: { revalidate: REVALIDATE } }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
  const json = (await res.json()) as Record<string, unknown>;
  const item = normalizeSerie(trimTMDBData(json), new Map());

  if (!item.description) {
    const url = new URL(`${BASE_URL}/tv/${id}`);
    url.searchParams.set('api_key', process.env.TMDB_API_KEY ?? '');
    url.searchParams.set('language', 'en-US');
    const fallback = await fetch(url.toString(), { next: { revalidate: REVALIDATE } });
    if (fallback.ok) {
      const fallbackJson = (await fallback.json()) as Record<string, unknown>;
      const overview = fallbackJson.overview as string | undefined;
      if (overview) return { ...item, description: overview };
    }
  }

  return item;
}
