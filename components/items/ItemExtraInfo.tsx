import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Item } from '@/types';

// ----- Helpers -----

function str(v: unknown): string | null {
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}
function num(v: unknown): number | null {
  return typeof v === 'number' && !isNaN(v) ? v : null;
}
function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

// ----- Status -----

const STATUS_STYLE: Record<string, string> = {
  Airing: 'bg-green-500/15 text-green-700 dark:text-green-400',
  Publishing: 'bg-green-500/15 text-green-700 dark:text-green-400',
  'Returning Series': 'bg-green-500/15 text-green-700 dark:text-green-400',
  'In Production': 'bg-green-500/15 text-green-700 dark:text-green-400',
  'Not yet aired': 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  'Post Production': 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  'Finished Airing': 'bg-muted text-muted-foreground',
  Finished: 'bg-muted text-muted-foreground',
  Released: 'bg-muted text-muted-foreground',
  Ended: 'bg-muted text-muted-foreground',
  Discontinued: 'bg-red-500/15 text-red-700 dark:text-red-400',
  Cancelled: 'bg-red-500/15 text-red-700 dark:text-red-400',
  'On Hiatus': 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
};

const STATUS_LABEL: Record<string, string> = {
  Airing: 'En emisión',
  Publishing: 'En publicación',
  'Returning Series': 'En emisión',
  'In Production': 'En producción',
  'Not yet aired': 'Próximamente',
  'Post Production': 'Postproducción',
  'Finished Airing': 'Finalizado',
  Finished: 'Finalizado',
  Released: 'Estrenado',
  Ended: 'Finalizado',
  Discontinued: 'Cancelado',
  Cancelled: 'Cancelado',
  'On Hiatus': 'En pausa',
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLE[status] ?? 'bg-muted text-muted-foreground';
  const label = STATUS_LABEL[status] ?? status;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full', style)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}

// ----- Building blocks -----

function InfoSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

function TagList({ tags }: { tags: string[] }) {
  if (!tags.length) return <span className="text-muted-foreground text-sm">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center px-2 py-0.5 rounded-md bg-accent text-xs font-medium text-foreground border border-border/60">
          {t}
        </span>
      ))}
    </div>
  );
}

// ----- Watch providers (TMDB) -----

const TMDB_IMG = 'https://image.tmdb.org/t/p/w45';

type TMDBProvider = { provider_name: string; logo_path?: string | null };
type TMDBCountryProviders = {
  link?: string;
  flatrate?: TMDBProvider[];
  rent?: TMDBProvider[];
  buy?: TMDBProvider[];
};

function WatchProviders({ data }: { data: unknown }) {
  if (!data || typeof data !== 'object') return null;
  const { results } = data as { results?: Record<string, TMDBCountryProviders> };
  const country = results?.['ES'] ?? results?.['US'];
  if (!country) return null;

  const groups: Array<{ label: string; items: TMDBProvider[] }> = [
    { label: 'Streaming', items: country.flatrate ?? [] },
    { label: 'Alquiler', items: country.rent ?? [] },
    { label: 'Compra', items: country.buy ?? [] },
  ].filter((g) => g.items.length > 0);

  if (!groups.length) return null;

  return (
    <InfoSection label="Dónde ver">
      <div className="space-y-2">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-xs text-muted-foreground mb-1">{group.label}</p>
            <div className="flex flex-wrap gap-2">
              {group.items.map((p) => (
                <span
                  key={p.provider_name}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-accent border border-border/60 text-xs font-medium"
                >
                  {p.logo_path && (
                    <Image
                      src={`${TMDB_IMG}${p.logo_path}`}
                      alt=""
                      width={16}
                      height={16}
                      className="rounded-sm object-contain"
                    />
                  )}
                  {p.provider_name}
                </span>
              ))}
            </div>
          </div>
        ))}
        {country.link && (
          <a
            href={country.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
          >
            Ver en JustWatch <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </InfoSection>
  );
}

// ----- Jikan streaming links -----

type StreamingEntry = { name: string; url: string };

function StreamingLinks({ links }: { links: StreamingEntry[] }) {
  if (!links.length) return null;
  return (
    <InfoSection label="Dónde ver">
      <div className="flex flex-wrap gap-2">
        {links.map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent border border-border/60 text-xs font-medium hover:border-primary/50 transition-colors"
          >
            {s.name}
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        ))}
      </div>
    </InfoSection>
  );
}

// ----- Jikan related works -----

const RELATION_LABEL: Record<string, string> = {
  Sequel: 'Secuela',
  Prequel: 'Precuela',
  'Alternative Setting': 'Ambientación alternativa',
  'Alternative Version': 'Versión alternativa',
  'Side Story': 'Historia paralela',
  Summary: 'Resumen',
  'Full Story': 'Historia completa',
  Adaptation: 'Adaptación',
  'Spin-off': 'Spin-off',
  Character: 'Personaje',
  Other: 'Otro',
  'Parent Story': 'Historia principal',
};

type JikanRelation = {
  relation: string;
  entry: Array<{ mal_id: number; type: string; name: string }>;
};

function RelatedWorks({ relations }: { relations: JikanRelation[] }) {
  if (!relations.length) return null;

  const filtered = relations.filter((r) =>
    ['Sequel', 'Prequel', 'Side Story', 'Alternative Version', 'Spin-off', 'Adaptation', 'Parent Story'].includes(
      r.relation
    )
  );
  if (!filtered.length) return null;

  return (
    <InfoSection label="Relacionados">
      <div className="space-y-1.5">
        {filtered.map((rel) => (
          <div key={rel.relation}>
            <span className="text-xs text-muted-foreground mr-2">{RELATION_LABEL[rel.relation] ?? rel.relation}:</span>
            {rel.entry.map((e, i) => (
              <span key={e.mal_id}>
                <Link
                  href={`/${e.type === 'anime' ? 'anime' : 'manga'}/${e.mal_id}`}
                  className="text-sm text-primary hover:underline"
                >
                  {e.name}
                </Link>
                {i < rel.entry.length - 1 && <span className="text-muted-foreground">, </span>}
              </span>
            ))}
          </div>
        ))}
      </div>
    </InfoSection>
  );
}

// ===================== CATEGORY SECTIONS =====================

function AnimeSection({ d }: { d: Record<string, unknown> }) {
  const status = str(d.status);
  const studios = arr<{ name: string }>(d.studios).map((s) => s.name);
  const producers = arr<{ name: string }>(d.producers).map((p) => p.name);
  const episodes = num(d.episodes);
  const duration = str(d.duration)?.replace(' per ep', '');
  const streaming = arr<StreamingEntry>(d.streaming);
  const relations = arr<JikanRelation>(d.relations);

  return (
    <>
      <div className="grid gap-4">
        {status && (
          <InfoSection label="Estado">
            <StatusBadge status={status} />
          </InfoSection>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {episodes && (
          <InfoSection label="Episodios">
            <span>{episodes}</span>
          </InfoSection>
        )}
        {duration && (
          <InfoSection label="Duración">
            <span>{duration}</span>
          </InfoSection>
        )}
        {studios.length > 0 && (
          <InfoSection label="Estudio">
            <TagList tags={studios} />
          </InfoSection>
        )}
        {producers.length > 0 && (
          <InfoSection label="Productoras">
            <TagList tags={producers.slice(0, 3)} />
          </InfoSection>
        )}
      </div>
      {streaming.length > 0 && <StreamingLinks links={streaming} />}
      {relations.length > 0 && <RelatedWorks relations={relations} />}
    </>
  );
}

function MangaSection({ d }: { d: Record<string, unknown> }) {
  const status = str(d.status);
  const volumes = num(d.volumes);
  const chapters = num(d.chapters);
  type AuthorEntry = { person: { name: string }; role: string };
  const authors = arr<AuthorEntry>(d.authors);
  const relations = arr<JikanRelation>(d.relations);

  const writers = authors.filter((a) => a.role === 'Story' || a.role === 'Story & Art').map((a) => a.person.name);
  const artists = authors.filter((a) => a.role === 'Art').map((a) => a.person.name);
  const both = authors.filter((a) => a.role === 'Story & Art').map((a) => a.person.name);

  return (
    <>
      <div className="grid gap-4">
        {status && (
          <InfoSection label="Estado">
            <StatusBadge status={status} />
          </InfoSection>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {volumes && (
          <InfoSection label="Volúmenes">
            <span>{volumes}</span>
          </InfoSection>
        )}
        {chapters && (
          <InfoSection label="Capítulos">
            <span>{chapters}</span>
          </InfoSection>
        )}
        {both.length > 0 && (
          <InfoSection label="Autor">
            <TagList tags={both} />
          </InfoSection>
        )}
        {writers.length > 0 && both.length === 0 && (
          <InfoSection label="Guión">
            <TagList tags={writers} />
          </InfoSection>
        )}
        {artists.length > 0 && both.length === 0 && (
          <InfoSection label="Arte">
            <TagList tags={artists} />
          </InfoSection>
        )}
      </div>
      {relations.length > 0 && <RelatedWorks relations={relations} />}
    </>
  );
}

type TMDBCredits = {
  cast?: Array<{ name: string; character: string }>;
  crew?: Array<{ name: string; job: string }>;
};
type TMDBSimilarResult = { id: number; title?: string; name?: string; poster_path?: string | null; release_date?: string; first_air_date?: string };

function MovieSection({ d }: { d: Record<string, unknown> }) {
  const status = str(d.status);
  const runtime = num(d.runtime);
  const credits = d.credits as TMDBCredits | undefined;
  const collection = d.belongs_to_collection as { name: string } | null | undefined;
  const companies = arr<{ name: string }>(d.production_companies).map((c) => c.name);
  const director = credits?.crew?.find((c) => c.job === 'Director');
  const cast = (credits?.cast ?? []).slice(0, 6).map((c) => c.name);

  return (
    <>
      <div className="grid gap-4">
        {status && (
          <InfoSection label="Estado">
            <StatusBadge status={status} />
          </InfoSection>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {runtime && (
          <InfoSection label="Duración">
            <span>{Math.floor(runtime / 60)}h {runtime % 60}min</span>
          </InfoSection>
        )}
        {director && (
          <InfoSection label="Director">
            <span>{director.name}</span>
          </InfoSection>
        )}
        {companies.length > 0 && (
          <InfoSection label="Productora">
            <TagList tags={companies.slice(0, 2)} />
          </InfoSection>
        )}
        {collection && (
          <InfoSection label="Saga">
            <span className="text-sm">{collection.name}</span>
          </InfoSection>
        )}
      </div>
      {cast.length > 0 && (
        <InfoSection label="Reparto principal">
          <TagList tags={cast} />
        </InfoSection>
      )}
      <WatchProviders data={d['watch/providers']} />
    </>
  );
}

function SerieSection({ d }: { d: Record<string, unknown> }) {
  const status = str(d.status);
  const seasons = num(d.number_of_seasons);
  const episodes = num(d.number_of_episodes);
  const createdBy = arr<{ name: string }>(d.created_by).map((c) => c.name);
  const networks = arr<{ name: string }>(d.networks).map((n) => n.name);
  const credits = d.credits as TMDBCredits | undefined;
  const cast = (credits?.cast ?? []).slice(0, 6).map((c) => c.name);

  return (
    <>
      <div className="grid gap-4">
        {status && (
          <InfoSection label="Estado">
            <StatusBadge status={status} />
          </InfoSection>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {seasons && (
          <InfoSection label="Temporadas">
            <span>{seasons}</span>
          </InfoSection>
        )}
        {episodes && (
          <InfoSection label="Episodios">
            <span>{episodes}</span>
          </InfoSection>
        )}
        {createdBy.length > 0 && (
          <InfoSection label="Creador">
            <TagList tags={createdBy} />
          </InfoSection>
        )}
        {networks.length > 0 && (
          <InfoSection label="Cadena">
            <TagList tags={networks} />
          </InfoSection>
        )}
      </div>
      {cast.length > 0 && (
        <InfoSection label="Reparto principal">
          <TagList tags={cast} />
        </InfoSection>
      )}
      <WatchProviders data={d['watch/providers']} />
    </>
  );
}

function BookSection({ d }: { d: Record<string, unknown> }) {
  const authors = arr<{ name: string }>(d._authors).map((a) => a.name);
  const subjects = arr<string>(d.subjects).slice(0, 8);
  const workKey = str(d.key);
  const olUrl = workKey ? `https://openlibrary.org${workKey}` : null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {authors.length > 0 && (
          <InfoSection label="Autor">
            <TagList tags={authors} />
          </InfoSection>
        )}
        {subjects.length > 0 && (
          <InfoSection label="Temáticas">
            <TagList tags={subjects} />
          </InfoSection>
        )}
      </div>
      {olUrl && (
        <InfoSection label="Leer en línea">
          <a
            href={olUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            Open Library <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </InfoSection>
      )}
    </>
  );
}

// ===================== MAIN =====================

export function ItemExtraInfo({ item }: { item: Item }) {
  const d = (item.external_data ?? {}) as Record<string, unknown>;

  const section = (() => {
    if (item.category === 'anime') return <AnimeSection d={d} />;
    if (item.category === 'manga') return <MangaSection d={d} />;
    if (item.category === 'pelicula') return <MovieSection d={d} />;
    if (item.category === 'serie') return <SerieSection d={d} />;
    if (item.category === 'libro') return <BookSection d={d} />;
    return null;
  })();

  if (!section) return null;

  return (
    <div className="mt-8 rounded-xl border border-border/60 bg-card/50 p-5 space-y-5">
      {section}
    </div>
  );
}
