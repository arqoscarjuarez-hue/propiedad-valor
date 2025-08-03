import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  is_approved: boolean;
  moderation_status: string;
  moderation_flags: string[] | null;
  created_at: string;
}

interface CommentsListProps {
  refreshTrigger: number;
}

export function CommentsList({ refreshTrigger }: CommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [refreshTrigger]);

  if (loading) {
    return <div className="text-center py-4">Cargando comentarios...</div>;
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay comentarios aún. ¡Sé el primero en comentar!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id} className={comment.is_approved ? '' : 'opacity-50 border-destructive'}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Usuario: {comment.user_id}
              </span>
              <div className="flex gap-2">
                <Badge variant={comment.is_approved ? "default" : "destructive"}>
                  {comment.moderation_status}
                </Badge>
                {comment.moderation_flags && comment.moderation_flags.length > 0 && (
                  <Badge variant="outline">
                    Flagged: {comment.moderation_flags.join(', ')}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              {new Date(comment.created_at).toLocaleString('es-ES')}
            </p>
            <p>{comment.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}