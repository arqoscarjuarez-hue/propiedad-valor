import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { commentTranslations } from "@/translations/commentTranslations";
import { supabase } from "@/integrations/supabase/client";

interface CommentFormProps {
  onCommentAdded: () => void;
}

export function CommentForm({ onCommentAdded }: CommentFormProps) {
  const { selectedLanguage } = useLanguage();
  const t = commentTranslations[selectedLanguage];
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: t.error,
        description: t.writeCommentError,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // For demo purposes, we'll use a dummy user_id
      // In a real app, you'd get this from auth
      const user_id = "demo-user-123";

      const { data, error } = await supabase.functions.invoke('moderate-comment', {
        body: {
          content: content.trim(),
          user_id,
        }
      });

      console.log('Function response:', data, error);

      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }

      if (data && data.success) {
        setContent("");
        onCommentAdded();
        
        if (data.moderated) {
          toast({
            title: t.commentModerated,
            description: t.moderatedDescription,
            variant: "destructive",
          });
        } else {
          const message = data.note ? 
            `${t.publishedWithNote}. ${data.note}` : 
            t.publishedDescription;
          
          toast({
            title: t.commentPublished,
            description: message,
          });
        }
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: t.error,
        description: t.sendError,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          />
          <Button type="submit" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? t.sending : t.publishComment}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}