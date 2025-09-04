-- ============================================================================
-- CORRECCIÓN FINAL: AJUSTAR FUNCIONES CON SEARCH_PATH FIJO (WARNING DEL LINTER)
-- ============================================================================

-- 1) Corregir función user_can_comment para fijar search_path
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

-- 2) Corregir función enhanced_security_audit para fijar search_path
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

-- 3) Corregir función auto_security_audit para fijar search_path
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

-- 4) Optimización: Limpiar automáticamente logs antiguos de auditoría (>90 días)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.security_audit_logs 
  WHERE created_at < now() - interval '90 days';
END;
$$;

-- ============================================================================