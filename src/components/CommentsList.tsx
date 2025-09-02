import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { commentTranslations } from "@/translations/commentTranslations";
import { supabase } from "@/integrations/supabase/client";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  is_approved: boolean;
  moderation_status: string;
  moderation_flags: string[] | null;
  created_at: string;
  parent_comment_id?: string | null;
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
        const isSystemReply = comment.user_id === 'sistema-automatico';
        const isReply = comment.parent_comment_id !== null;
        
        return (
          <div key={comment.id} className={isReply ? "ml-8 mt-2" : ""}>
            <Card className={`${comment.is_approved ? '' : 'opacity-50 border-destructive'} ${isSystemReply ? 'bg-primary/5 border-primary/20' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {isSystemReply ? t.systemResponse : 
                     comment.user_id === 'visitante' ? 'Visitante' : 
                     comment.user_id === 'sistema-automatico' ? t.systemResponse : 
                     `${t.user}`}
                  </span>
                  <div className="flex gap-2">
                    {isSystemReply && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        🤖 Sistema
                      </Badge>
                    )}
                    <Badge variant={comment.is_approved ? "default" : "destructive"}>
                      {comment.moderation_status}
                    </Badge>
                    {comment.moderation_flags && comment.moderation_flags.length > 0 && (
                      <Badge variant="outline">
                        {t.flagged}: {comment.moderation_flags.join(', ')}
                      </Badge>
                    )}
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