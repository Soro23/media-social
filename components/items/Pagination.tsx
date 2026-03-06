'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  hasNextPage: boolean;
}

export function Pagination({ currentPage, hasNextPage }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  if (currentPage <= 1 && !hasNextPage) return null;

  const btnBase =
    'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed';
  const btnActive =
    'border-border bg-background text-foreground hover:border-primary/50 hover:text-primary';

  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <button
        className={cn(btnBase, btnActive)}
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </button>

      <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary text-sm font-semibold">
        {currentPage}
      </span>

      <button
        className={cn(btnBase, btnActive)}
        onClick={() => goToPage(currentPage + 1)}
        disabled={!hasNextPage}
      >
        Siguiente
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
