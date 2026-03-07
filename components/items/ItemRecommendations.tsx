import Image from 'next/image';
import Link from 'next/link';
import type { Item } from '@/types';

const TMDB_IMG = 'https://image.tmdb.org/t/p/w185';

interface RecItem {
  id: string | number;
  title: string;
  imageUrl: string | null;
  href: string;
}

function parseRecommendations(item: Item): RecItem[] {
  const d = (item.external_data ?? {}) as Record<string, unknown>;

  if (item.category === 'anime' || item.category === 'manga') {
    type JikanRec = {
      entry?: {
        mal_id?: number;
        title?: string;
        images?: { jpg?: { large_image_url?: string; image_url?: string } };
      };
    };
    const recs = Array.isArray(d._recommendations) ? (d._recommendations as JikanRec[]) : [];
    const base = item.category === 'anime' ? '/anime' : '/manga';
    return recs
      .filter((r) => r.entry?.mal_id)
      .map((r) => ({
        id: r.entry!.mal_id!,
        title: r.entry!.title ?? '',
        imageUrl: r.entry!.images?.jpg?.large_image_url ?? r.entry!.images?.jpg?.image_url ?? null,
        href: `${base}/${r.entry!.mal_id}`,
      }));
  }

  if (item.category === 'pelicula' || item.category === 'serie') {
    type TMDBSimilar = {
      id?: number;
      title?: string;
      name?: string;
      poster_path?: string | null;
      release_date?: string;
      first_air_date?: string;
    };
    const similar = d.similar as { results?: TMDBSimilar[] } | undefined;
    const results = similar?.results ?? [];
    const base = item.category === 'pelicula' ? '/peliculas' : '/series';
    return results
      .filter((r) => r.id)
      .map((r) => ({
        id: r.id!,
        title: r.title ?? r.name ?? '',
        imageUrl: r.poster_path ? `${TMDB_IMG}${r.poster_path}` : null,
        href: `${base}/${r.id}`,
      }));
  }

  return [];
}

export function ItemRecommendations({ item }: { item: Item }) {
  const recs = parseRecommendations(item);
  if (!recs.length) return null;

  const label =
    item.category === 'anime' || item.category === 'manga'
      ? 'Recomendaciones'
      : 'Títulos similares';

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">{label}</h2>
      <div
        className="flex gap-3 overflow-x-auto pb-3"
        style={{ scrollbarWidth: 'thin' }}
      >
        {recs.map((rec) => (
          <Link
            key={rec.id}
            href={rec.href}
            className="flex-shrink-0 w-24 sm:w-28 group"
          >
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted shadow-sm group-hover:shadow-md transition-all duration-200">
              {rec.imageUrl ? (
                <Image
                  src={rec.imageUrl}
                  alt={rec.title}
                  fill
                  sizes="112px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-muted-foreground text-[10px] leading-tight">
                  {rec.title}
                </div>
              )}
            </div>
            <p className="mt-1.5 text-xs font-medium leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {rec.title}
            </p>
          </Link>
        ))}
        {/* spacer so last item clears edge */}
        <span className="flex-shrink-0 w-1" />
      </div>
    </div>
  );
}
