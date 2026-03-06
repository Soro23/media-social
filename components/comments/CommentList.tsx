'use client';

import { useState, useTransition } from 'react';
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
      <p className="text-sm text-muted-foreground py-4 text-center">
        Sé el primero en comentar
      </p>
    );
  }

  return (
    <div className="space-y-4">
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
  const [isPending, startTransition] = useTransition();
  const [reportOpen, setReportOpen] = useState(false);

  function handleDelete() {
    if (!confirm('¿Eliminar este comentario?')) return;
    startTransition(async () => {
      const result = await deleteCommentAction(comment.id);
      if (!result.success) toast.error(result.error);
      else toast.success('Comentario eliminado');
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
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.avatar_url || undefined} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">@{username}</span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
        </div>
        <p className="text-sm mt-1 break-words whitespace-pre-wrap">{comment.content}</p>
      </div>

      <div className="flex items-start gap-1 flex-shrink-0">
        {isOwner ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ) : (
          isAuthenticated && (
            <ReportDialog
              commentId={comment.id}
              open={reportOpen}
              onOpenChange={setReportOpen}
            />
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
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-orange-500">
          <Flag className="h-3.5 w-3.5" />
        </Button>
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
