'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        action: {
          label: 'Iniciar sesión',
          onClick: () => router.push('/login'),
        },
      });
      return;
    }

    // Optimistic update
    const previousValue = isFavorite;
    setIsFavorite(!isFavorite);

    startTransition(async () => {
      const result = await toggleFavoriteAction(itemId);
      if (!result.success) {
        setIsFavorite(previousValue); // Rollback
        toast.error(result.error);
      } else {
        toast.success(result.data.isFavorite ? 'Añadido a favoritos' : 'Eliminado de favoritos');
      }
    });
  }

  return (
    <Button
      variant={isFavorite ? 'default' : 'outline'}
      size="lg"
      onClick={handleClick}
      disabled={isPending}
      className={cn('gap-2', isFavorite && 'bg-red-500 hover:bg-red-600 border-red-500')}
    >
      <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
      {isFavorite ? 'En favoritos' : 'Añadir a favoritos'}
    </Button>
  );
}
