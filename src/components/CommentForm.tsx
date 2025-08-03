import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CommentFormProps {
  onCommentAdded: () => void;
}

export function CommentForm({ onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Por favor escribe un comentario",
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
            title: "Comentario moderado",
            description: "Tu comentario fue bloqueado por contenido inapropiado",
            variant: "destructive",
          });
        } else {
          const message = data.note ? 
            `Tu comentario ha sido publicado. ${data.note}` : 
            "Tu comentario ha sido publicado exitosamente";
          
          toast({
            title: "Comentario publicado",
            description: message,
          });
        }
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el comentario. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agregar Comentario</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe tu comentario aquí..."
            rows={4}
            disabled={isSubmitting}
          />
          <Button type="submit" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? "Enviando..." : "Publicar Comentario"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}