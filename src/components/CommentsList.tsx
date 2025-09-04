import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { commentTranslations } from "@/translations/commentTranslations";
import { supabase } from "@/integrations/supabase/client";

interface Comment {
  id: string;
  content: string;
  is_approved: boolean;
  anonymous_author: string;
  created_at: string;
}

interface CommentsListProps {
  refreshTrigger: number;
}

export function CommentsList({ refreshTrigger }: CommentsListProps) {
  const { selectedLanguage } = useLanguage();
  const t = commentTranslations[selectedLanguage];
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_anonymized_comments');

      if (error) {
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
    return <div className="text-center py-4">{t.loadingComments}</div>;
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t.noComments}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const isSystemReply = comment.anonymous_author === 'Sistema';
        
        return (
          <div key={comment.id}>
            <Card className={`${comment.is_approved ? '' : 'opacity-50 border-destructive'} ${isSystemReply ? 'bg-primary/5 border-primary/20' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {comment.anonymous_author}
                  </span>
                  <div className="flex gap-2">
                    {isSystemReply && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        🤖 Sistema
                      </Badge>
                    )}
                    <Badge variant={comment.is_approved ? "default" : "destructive"}>
                      {comment.is_approved ? 'Aprobado' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {new Date(comment.created_at).toLocaleString(selectedLanguage === 'es' ? 'es-ES' : selectedLanguage === 'en' ? 'en-US' : selectedLanguage === 'fr' ? 'fr-FR' : selectedLanguage === 'de' ? 'de-DE' : selectedLanguage === 'it' ? 'it-IT' : 'pt-PT')}
                </p>
                <p className={isSystemReply ? 'font-medium text-primary' : ''}>{comment.content}</p>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}