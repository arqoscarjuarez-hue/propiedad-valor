-- ============================================
-- SECURITY FIXES - Critical Issues
-- ============================================

-- 1. FIX: Secure Comment Rate Limiting
-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Allow system to manage rate limits" ON public.comment_rate_limits;
DROP POLICY IF EXISTS "Users can view their own rate limits" ON public.comment_rate_limits;

-- Create secure policies
CREATE POLICY "Users can view their own rate limits"
ON public.comment_rate_limits
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can manage rate limits"
ON public.comment_rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. FIX: Enforce Email Visibility Controls
-- Create security definer function to get visible profile data
CREATE OR REPLACE FUNCTION public.get_visible_profile_data(profile_id uuid, requesting_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  display_name text,
  email text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.display_name,
    CASE 
      WHEN p.email_visible = true OR p.user_id = requesting_user_id THEN p.email
      ELSE NULL
    END as email,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.id = profile_id;
END;
$$;

-- 3. FIX: Restrict Security Audit Log Writes
-- Drop overly permissive insert policy
DROP POLICY IF EXISTS "Authenticated can insert audit logs" ON public.security_audit_logs;

-- Create restrictive policies
CREATE POLICY "Service role can insert audit logs"
ON public.security_audit_logs
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Admins can insert audit logs"
ON public.security_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Update functions to use service role context where needed
-- Ensure enhanced_security_audit function works correctly
CREATE OR REPLACE FUNCTION public.enhanced_security_audit(
  operation_type text,
  table_affected text DEFAULT NULL,
  user_context jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function runs as SECURITY DEFINER so it can insert into audit logs
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

-- Update log_sensitive_operation function
CREATE OR REPLACE FUNCTION public.log_sensitive_operation(
  operation_type text,
  table_name text DEFAULT NULL,
  record_id uuid DEFAULT NULL,
  additional_data jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function runs as SECURITY DEFINER so it can insert into audit logs
  INSERT INTO public.security_audit_logs (
    event_type,
    details,
    user_id,
    created_at
  ) VALUES (
    operation_type,
    jsonb_build_object(
      'table', table_name,
      'record_id', record_id,
      'additional_data', additional_data,
      'ip_address', current_setting('request.header.x-forwarded-for', true),
      'user_agent', current_setting('request.header.user-agent', true),
      'timestamp', extract(epoch from now())
    ),
    auth.uid(),
    now()
  );
END;
$$;

-- Update log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type text,
  event_details jsonb DEFAULT NULL,
  user_id_param uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function runs as SECURITY DEFINER so it can insert into audit logs
  INSERT INTO public.security_audit_logs (
    event_type,
    details,
    user_id,
    created_at
  ) VALUES (
    event_type,
    event_details,
    COALESCE(user_id_param, auth.uid()),
    now()
  );
END;
$$;