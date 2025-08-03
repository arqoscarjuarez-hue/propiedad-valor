import { useState } from "react";
import { CommentForm } from "./CommentForm";
import { CommentsList } from "./CommentsList";

export function CommentSystem() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCommentAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Sistema de Comentarios con Moderación</h1>
        <p className="text-muted-foreground">
          Los comentarios son moderados automáticamente usando OpenAI
        </p>
      </div>
      
      <CommentForm onCommentAdded={handleCommentAdded} />
      <CommentsList refreshTrigger={refreshTrigger} />
    </div>
  );
}