'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  fallbackHref: string;
  label: string;
}

export function BackButton({ fallbackHref, label }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      aria-label={`Volver a ${label}`}
    >
      <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      {label}
    </button>
  );
}
