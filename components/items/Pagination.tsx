'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  totalPages?: number;
}

/**
 * Builds the list of page tokens to render.
 * Returns an array of numbers and '…' strings.
 * Always includes page 1 and totalPages.
 * Shows a window of ±2 around the current page.
 */
function buildPageTokens(current: number, total: number): (number | '…')[] {
  // Window: current-2 … current+2, always include 1 and total
  const window = 2;
  const visible = new Set<number>();
  visible.add(1);
  visible.add(total);
  for (let p = current - window; p <= current + window; p++) {
    if (p >= 1 && p <= total) visible.add(p);
  }

  const sorted = [...visible].sort((a, b) => a - b);
  const tokens: (number | '…')[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      tokens.push('…');
    }
    tokens.push(sorted[i]);
  }

  return tokens;
}

export function Pagination({ currentPage, hasNextPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (currentPage <= 1 && !hasNextPage) return null;

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete('pagina');
    } else {
      params.set('pagina', String(page));
    }
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const navBtn = (disabled: boolean) =>
    cn(
      'inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-150',
      disabled
        ? 'opacity-40 cursor-not-allowed border-border text-muted-foreground'
        : 'border-border bg-background text-foreground hover:border-primary/50 hover:text-primary cursor-pointer'
    );

  const pageBtn = (active: boolean) =>
    cn(
      'inline-flex items-center justify-center h-9 w-9 rounded-lg text-sm font-medium border transition-all duration-150 cursor-pointer',
      active
        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
        : 'border-border bg-background text-foreground hover:border-primary/50 hover:text-primary'
    );

  const tokens = totalPages ? buildPageTokens(currentPage, totalPages) : null;

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
      {/* Prev */}
      <button
        className={navBtn(currentPage <= 1)}
        onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      {/* Page numbers */}
      {tokens ? (
        tokens.map((token, i) =>
          token === '…' ? (
            <span
              key={`ellipsis-${i}`}
              className="inline-flex items-center justify-center h-9 w-9 text-muted-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <button
              key={token}
              className={pageBtn(token === currentPage)}
              onClick={() => token !== currentPage && goToPage(token)}
              aria-current={token === currentPage ? 'page' : undefined}
            >
              {token}
            </button>
          )
        )
      ) : (
        /* Fallback when totalPages is unknown */
        <span className="inline-flex items-center justify-center h-9 px-3 rounded-lg bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
          {currentPage}
        </span>
      )}

      {/* Next */}
      <button
        className={navBtn(!hasNextPage)}
        onClick={() => hasNextPage && goToPage(currentPage + 1)}
        disabled={!hasNextPage}
        aria-label="Página siguiente"
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
