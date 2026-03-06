'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2, Flag } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { deleteCommentAction, reportCommentAction } from '@/app/actions/social';
import { toast } from 'sonner';
import type { CommentWithProfile } from '@/types';

interface CommentListProps {
  comments: CommentWithProfile[];
  currentUserId: string | null;
}

export function CommentList({ comments, currentUserId }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        Todavia no hay comentarios. Se el primero.
      </p>
    );
  }

  return (
    <div className="divide-y divide-border/60">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          isOwner={currentUserId === comment.user_id}
          isAuthenticated={!!currentUserId}
        />
      ))}
    </div>
  );
}

function CommentItem({
  comment,
  isOwner,
  isAuthenticated,
}: {
  comment: CommentWithProfile;
  isOwner: boolean;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reportOpen, setReportOpen] = useState(false);

  function handleDelete() {
    if (!confirm('¿Eliminar este comentario?')) return;
    startTransition(async () => {
      const result = await deleteCommentAction(comment.id);
      if (!result.success) {
        toast.error(result.error);
      } else {
        toast.success('Comentario eliminado');
        router.refresh();
      }
    });
  }

  const username = comment.username || 'usuario';
  const displayName = comment.profiles?.display_name || username;
  const initials = displayName.slice(0, 2).toUpperCase();
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: es,
  });

  return (
    <div className="flex gap-3 py-4 group/comment">
      <Avatar className="h-8 w-8 flex-shrink-0 mt-0.5">
        <AvatarImage src={comment.avatar_url || undefined} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold">@{username}</span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        <p className="text-sm mt-1.5 text-foreground/90 leading-relaxed break-words whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>

      <div className="flex items-start gap-0.5 opacity-0 group-hover/comment:opacity-100 transition-opacity flex-shrink-0">
        {isOwner ? (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        ) : (
          isAuthenticated && (
            <ReportDialog commentId={comment.id} open={reportOpen} onOpenChange={setReportOpen} />
          )
        )}
      </div>
    </div>
  );
}

function ReportDialog({
  commentId,
  open,
  onOpenChange,
}: {
  commentId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('commentId', commentId);

    startTransition(async () => {
      const result = await reportCommentAction(formData);
      if (result.success) {
        toast.success('Comentario reportado. Lo revisaremos pronto.');
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          className="p-1.5 rounded-md text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 transition-all"
          title="Reportar"
        >
          <Flag className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reportar comentario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Input
              id="reason"
              name="reason"
              placeholder="Ej: Lenguaje ofensivo, spam..."
              maxLength={500}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Enviando...' : 'Reportar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
