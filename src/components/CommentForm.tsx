import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { commentTranslations } from "@/translations/commentTranslations";
import { createAutoReply } from "@/utils/autoReply";
import { supabase } from "@/integrations/supabase/client";

interface CommentFormProps {
  onCommentAdded: () => void;
}

export function CommentForm({ onCommentAdded }: CommentFormProps) {
  const { selectedLanguage } = useLanguage();
  const { user } = useAuth();
  const t = commentTranslations[selectedLanguage];
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      console.error("Autenticación requerida. Debes iniciar sesión para comentar.");
      return;
    }
    
    if (!content.trim()) {
      console.error(t.writeCommentError);
      return;
    }

    // Input validation and sanitization
    const sanitizedContent = content.trim();
    if (sanitizedContent.length > 1000) {
      console.error("El comentario no puede exceder 1000 caracteres.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('moderate-comment', {
        body: {
          content: sanitizedContent,
          user_id: user.id,
        }
      });

      // Proceso de moderación de comentario

      if (error) {
        // Error en la función de moderación
        throw error;
      }

      if (data && data.success) {
        setContent("");
        
        if (data.moderated) {
          console.log(t.commentModerated, t.moderatedDescription);
        } else {
          const message = data.note ? 
            `${t.publishedWithNote}. ${data.note}` : 
            t.publishedDescription;
          
          console.log(t.commentPublished, message);
          
          // Generate auto-reply with system user (secure implementation)
          if (data.comment && data.comment.id) {
            setTimeout(async () => {
              try {
                const autoReplyContent = commentTranslations[selectedLanguage].autoReply;
                const { error: autoReplyError } = await supabase.functions.invoke('moderate-comment', {
                  body: {
                    content: autoReplyContent,
                    user_id: '00000000-0000-0000-0000-000000000000', // System user UUID
                  },
                });
                
                if (autoReplyError) {
                  console.error('Auto-reply failed:', autoReplyError);
                } else {
                  onCommentAdded(); // Refresh to show auto-reply
                }
              } catch (error) {
                console.error('Auto-reply creation failed:', error);
              }
            }, 2000);
          }
        }
        
        onCommentAdded();
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
    } catch (error) {
      // Error enviando comentario
      console.error(t.error, t.sendError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t.addComment}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-4">
            Debes iniciar sesión para comentar
          </p>
          <Button onClick={() => window.location.href = '/auth'}>
            Iniciar Sesión
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.addComment}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.commentPlaceholder}
            rows={4}
            disabled={isSubmitting}
            maxLength={1000}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {content.length}/1000 caracteres
            </span>
            <Button type="submit" disabled={isSubmitting || !content.trim()}>
              {isSubmitting ? t.sending : t.publishComment}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}