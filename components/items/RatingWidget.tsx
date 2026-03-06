'use client';

import { useState, useTransition } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { upsertRatingAction } from '@/app/actions/social';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface RatingWidgetProps {
  itemId: string;
  currentUserScore: number | null;
  avgRating: number;
  ratingCount: number;
  isAuthenticated: boolean;
}

export function RatingWidget({
  itemId,
  currentUserScore,
  avgRating,
  ratingCount,
  isAuthenticated,
}: RatingWidgetProps) {
  const router = useRouter();
  const [hoveredScore, setHoveredScore] = useState<number | null>(null);
  const [userScore, setUserScore] = useState<number | null>(currentUserScore);
  const [isPending, startTransition] = useTransition();

  function handleRate(score: number) {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para puntuar', {
        action: {
          label: 'Iniciar sesión',
          onClick: () => router.push('/login'),
        },
      });
      return;
    }

    const prev = userScore;
    setUserScore(score);

    const formData = new FormData();
    formData.set('itemId', itemId);
    formData.set('score', String(score));

    startTransition(async () => {
      const result = await upsertRatingAction(formData);
      if (!result.success) {
        setUserScore(prev);
        toast.error(result.error);
      } else {
        toast.success(`Has puntuado con ${score}/10`);
      }
    });
  }

  const displayScore = hoveredScore ?? userScore;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-lg">{avgRating > 0 ? avgRating : '—'}</span>
          <span className="text-sm text-muted-foreground">/ 10</span>
        </div>
        {ratingCount > 0 && (
          <span className="text-sm text-muted-foreground">
            ({ratingCount} {ratingCount === 1 ? 'votación' : 'votaciones'})
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <span className="text-sm text-muted-foreground mr-1">Tu nota:</span>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
          <button
            key={score}
            type="button"
            disabled={isPending}
            className={cn(
              'w-7 h-7 text-xs font-medium rounded transition-colors',
              displayScore !== null && displayScore >= score
                ? 'bg-yellow-400 text-yellow-900'
                : 'bg-muted text-muted-foreground hover:bg-yellow-200'
            )}
            onMouseEnter={() => setHoveredScore(score)}
            onMouseLeave={() => setHoveredScore(null)}
            onClick={() => handleRate(score)}
          >
            {score}
          </button>
        ))}
        {userScore !== null && (
          <span className="text-xs text-muted-foreground ml-1">({userScore}/10)</span>
        )}
      </div>
    </div>
  );
}
