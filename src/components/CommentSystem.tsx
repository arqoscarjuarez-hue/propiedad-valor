import { useState } from "react";
import { CommentForm } from "./CommentForm";
import { CommentsList } from "./CommentsList";
import { useLanguage } from "@/hooks/useLanguage";
import { commentTranslations } from "@/translations/commentTranslations";

export function CommentSystem() {
  const { selectedLanguage } = useLanguage();
  const t = commentTranslations[selectedLanguage];
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCommentAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{t.commentSystemTitle}</h1>
        <p className="text-muted-foreground">
          {t.commentSystemDescription}
        </p>
      </div>
      
      <CommentForm onCommentAdded={handleCommentAdded} />
      <CommentsList refreshTrigger={refreshTrigger} />
    </div>
  );
}