'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { addCommentAction } from '@/app/actions/social';
import { toast } from 'sonner';

interface CommentFormProps {
  itemId: string;
  isAuthenticated: boolean;
}

export function CommentForm({ itemId, isAuthenticated }: CommentFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [charCount, setCharCount] = useState(0);

  if (!isAuthenticated) {
    return (
      <div className="border rounded-lg p-4 text-center bg-muted/50">
        <p className="text-sm text-muted-foreground mb-3">
          Inicia sesión para dejar un comentario
        </p>
        <Button size="sm" onClick={() => router.push('/login')}>
          Iniciar sesión
        </Button>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await addCommentAction(formData);
      if (result.success) {
        toast.success('Comentario publicado');
        formRef.current?.reset();
        setCharCount(0);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
      <input type="hidden" name="itemId" value={itemId} />

      <div className="space-y-1.5">
        <Label htmlFor="content">Tu comentario</Label>
        <textarea
          id="content"
          name="content"
          rows={3}
          maxLength={2000}
          required
          placeholder="¿Qué opinas?"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          onChange={(e) => setCharCount(e.target.value.length)}
        />
        <p className="text-xs text-right text-muted-foreground">{charCount}/2000</p>
      </div>

      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? 'Publicando...' : 'Publicar comentario'}
      </Button>
    </form>
  );
}
