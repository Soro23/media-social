'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toggleFavoriteAction } from '@/app/actions/social';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  itemId: string;
  initialIsFavorite: boolean;
  isAuthenticated: boolean;
}

export function FavoriteButton({ itemId, initialIsFavorite, isAuthenticated }: FavoriteButtonProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para guardar favoritos', {
        action: { label: 'Iniciar sesión', onClick: () => router.push('/login') },
      });
      return;
    }

    const previousValue = isFavorite;
    setIsFavorite(!isFavorite);

    startTransition(async () => {
      const result = await toggleFavoriteAction(itemId);
      if (!result.success) {
        setIsFavorite(previousValue);
        toast.error(result.error);
      } else {
        toast.success(result.data.isFavorite ? 'Añadido a favoritos' : 'Eliminado de favoritos');
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200',
        isFavorite
          ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600 hover:shadow-rose-600/30'
          : 'bg-background border-border text-foreground hover:border-rose-400 hover:text-rose-500',
        isPending && 'opacity-70 cursor-not-allowed'
      )}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-transform duration-200',
          isFavorite && 'fill-current scale-110'
        )}
      />
      {isFavorite ? 'En favoritos' : 'Añadir a favoritos'}
    </button>
  );
}
