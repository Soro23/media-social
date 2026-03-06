'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
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
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Inicia sesión para unirte a la discusión
        </p>
        <button
          onClick={() => router.push('/login')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Iniciar sesión
        </button>
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
    <form ref={formRef} onSubmit={handleSubmit}>
      <input type="hidden" name="itemId" value={itemId} />
      <div className="relative">
        <textarea
          name="content"
          rows={3}
          maxLength={2000}
          required
          placeholder="Comparte tu opinión..."
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none transition-all pr-24"
          onChange={(e) => setCharCount(e.target.value.length)}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span className={`text-xs ${charCount > 1800 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {charCount}/2000
          </span>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            <Send className="h-3 w-3" />
            {isPending ? 'Enviando...' : 'Publicar'}
          </button>
        </div>
      </div>
    </form>
  );
}
