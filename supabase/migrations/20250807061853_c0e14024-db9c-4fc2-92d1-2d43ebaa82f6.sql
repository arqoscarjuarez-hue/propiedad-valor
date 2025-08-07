-- Eliminar comentarios con contenido inapropiado (profanidad)
DELETE FROM comments 
WHERE content ILIKE '%putas%' 
   OR content ILIKE '%mierda%' 
   OR content ILIKE '%pendejo%' 
   OR content ILIKE '%cerote%'
   OR moderation_status = 'rejected';