-- Agregar columna parent_comment_id para respuestas automáticas
ALTER TABLE public.comments 
ADD COLUMN parent_comment_id UUID REFERENCES public.comments(id);

-- Agregar índice para mejorar el rendimiento de las consultas
CREATE INDEX idx_comments_parent_id ON public.comments(parent_comment_id);