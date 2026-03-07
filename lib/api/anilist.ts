// Wrapper para AniList GraphQL API
// Docs: https://anilist.gitbook.io/anilist-apiv2-docs/
// Sin API key requerida | Rate limit: 90 req/min
// Usado como fuente secundaria de descripción e imagen para anime/manga

const ENDPOINT = 'https://graphql.anilist.co';
const REVALIDATE = 3600;

const MEDIA_QUERY = `
query ($malId: Int, $type: MediaType) {
  Media(idMal: $malId, type: $type) {
    description(asHtml: false)
    coverImage { extraLarge large }
  }
}
`;

interface AniListResult {
  description: string | null;
  coverImage: { extraLarge: string | null; large: string | null } | null;
}

/**
 * Obtiene descripción e imagen de AniList por MAL ID.
 * Devuelve null si no se encuentra o hay error (no lanza excepción).
 */
export async function fetchAniListByMalId(
  malId: number,
  type: 'ANIME' | 'MANGA',
): Promise<AniListResult | null> {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query: MEDIA_QUERY, variables: { malId, type } }),
      next: { revalidate: REVALIDATE },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as {
      data?: { Media?: AniListResult };
      errors?: unknown[];
    };

    if (json.errors || !json.data?.Media) return null;
    return json.data.Media;
  } catch {
    return null;
  }
}
