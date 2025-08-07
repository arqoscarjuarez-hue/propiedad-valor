-- Eliminar comentarios con contenido inapropiado y sus respuestas
-- Primero eliminar las respuestas (comentarios hijos)
DELETE FROM comments 
WHERE parent_comment_id IN (
  SELECT id FROM comments 
  WHERE content ILIKE '%putas%' 
     OR content ILIKE '%mierda%' 
     OR content ILIKE '%pendejo%' 
     OR content ILIKE '%cerote%'
     OR moderation_status = 'rejected'
);

-- Luego eliminar los comentarios principales inapropiados
DELETE FROM comments 
WHERE content ILIKE '%putas%' 
   OR content ILIKE '%mierda%' 
   OR content ILIKE '%pendejo%' 
   OR content ILIKE '%cerote%'
   OR moderation_status = 'rejected';