-- ============================================================================
-- SEGURIDAD: RATE LIMITING EN COMENTARIOS + AUDITORÍA (CORREGIDA)
-- ============================================================================

-- 1) FUNCION SEGURA: verificar si el usuario puede comentar (conteo sobre comments)
CREATE OR REPLACE FUNCTION public.user_can_comment(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
DECLARE
  recent_count integer := 0;
BEGIN
  IF user_id_param IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT COUNT(*) INTO recent_count
  FROM public.comments c
  WHERE c.user_id = user_id_param
    AND c.created_at >= now() - interval '5 minutes';

  RETURN recent_count < 5; -- máx 5 comentarios por 5 minutos
END;
$$;

-- 2) Reemplazar política de INSERT en comments para incluir rate limiting
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
CREATE POLICY "Authenticated users can create comments"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND user_id = auth.uid()
  AND public.user_can_comment(auth.uid())
);

-- 3) Permitir a usuarios borrar su propio perfil (si no existía)
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- 4) Auditoría mejorada
CREATE OR REPLACE FUNCTION public.enhanced_security_audit(
  operation_type text,
  table_affected text DEFAULT NULL,
  user_context jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.security_audit_logs (
    event_type,
    details,
    user_id,
    created_at
  ) VALUES (
    operation_type,
    jsonb_build_object(
      'table', table_affected,
      'user_context', user_context,
      'session_id', current_setting('request.header.x-session-id', true),
      'ip_address', current_setting('request.header.x-forwarded-for', true),
      'user_agent', current_setting('request.header.user-agent', true),
      'timestamp', extract(epoch from now())
    ),
    auth.uid(),
    now()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_security_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_TABLE_NAME IN ('comments', 'profiles', 'authorized_users') THEN
    PERFORM public.enhanced_security_audit(
      TG_OP || '_' || TG_TABLE_NAME,
      TG_TABLE_NAME,
      jsonb_build_object(
        'record_id', COALESCE(NEW.id, OLD.id),
        'operation', TG_OP
      )
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS auto_audit_comments ON public.comments;
CREATE TRIGGER auto_audit_comments
  AFTER INSERT OR UPDATE OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.auto_security_audit();

DROP TRIGGER IF EXISTS auto_audit_profiles ON public.profiles;
CREATE TRIGGER auto_audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.auto_security_audit();

-- 5) Índices para rendimiento en validación de rate limiting y auditoría
CREATE INDEX IF NOT EXISTS idx_comments_user_time ON public.comments (user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_time ON public.security_audit_logs (user_id, created_at);

-- Nota: No se altera la tabla comment_rate_limits ni sus políticas; 
-- el rate limiting ahora se basa en la propia tabla comments vía función segura.
-- ============================================================================