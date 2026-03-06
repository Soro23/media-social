'use client';

import { useState, useTransition } from 'react';
import { Star } from 'lucide-react';
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
        action: { label: 'Iniciar sesión', onClick: () => router.push('/login') },
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
        toast.success(`Puntuado con ${score}/10`);
      }
    });
  }

  const displayScore = hoveredScore ?? userScore;

  return (
    <div className="space-y-3">
      {/* Community avg */}
      <div className="flex items-baseline gap-2">
        <div className="flex items-center gap-1.5">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          <span className="text-2xl font-bold tracking-tight">
            {avgRating > 0 ? avgRating : '—'}
          </span>
          <span className="text-sm text-muted-foreground font-medium">/10</span>
        </div>
        {ratingCount > 0 && (
          <span className="text-sm text-muted-foreground">
            {ratingCount.toLocaleString('es')} {ratingCount === 1 ? 'voto' : 'votos'}
          </span>
        )}
      </div>

      {/* User score input */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
          Tu puntuación
        </p>
        <div className="flex items-center gap-1" onMouseLeave={() => setHoveredScore(null)}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => {
            const filled = displayScore !== null && displayScore >= score;
            return (
              <button
                key={score}
                type="button"
                disabled={isPending}
                className={cn(
                  'w-8 h-8 rounded-lg text-xs font-bold transition-all duration-100 border',
                  filled
                    ? 'bg-yellow-400 border-yellow-400 text-yellow-900 scale-110 shadow-sm'
                    : 'bg-background border-border text-muted-foreground hover:border-yellow-400/70 hover:text-yellow-600'
                )}
                onMouseEnter={() => setHoveredScore(score)}
                onClick={() => handleRate(score)}
              >
                {score}
              </button>
            );
          })}
          {userScore !== null && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({userScore}/10)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
