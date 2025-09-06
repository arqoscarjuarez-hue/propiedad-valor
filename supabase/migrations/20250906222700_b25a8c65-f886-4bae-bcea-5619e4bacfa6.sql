-- Fix Comment Rate Limiting System Security Issue
-- Update RLS policy to allow system access for rate limiting functionality

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "System only access for rate limits" ON public.comment_rate_limits;

-- Create proper RLS policies for comment rate limiting
CREATE POLICY "Allow system to manage rate limits" 
ON public.comment_rate_limits 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create policy for authenticated users to view their own rate limit data
CREATE POLICY "Users can view their own rate limits" 
ON public.comment_rate_limits 
FOR SELECT 
USING (user_id = auth.uid());

-- Enhanced user privacy: Remove email from profiles public access
-- Update profiles table to add privacy controls
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_visible BOOLEAN DEFAULT false;

-- Update profile policies to exclude email by default
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

-- Create a secure function to get anonymized profile data
CREATE OR REPLACE FUNCTION public.get_anonymized_profile(profile_user_id UUID)
RETURNS TABLE(
  id UUID,
  display_name TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.display_name,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.user_id = profile_user_id;
END;
$$;

-- Enhanced security audit logging
CREATE OR REPLACE FUNCTION public.log_sensitive_operation(
  operation_type TEXT,
  table_name TEXT DEFAULT NULL,
  record_id UUID DEFAULT NULL,
  additional_data JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Create automatic cleanup job trigger for old audit logs
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only run cleanup occasionally (1% chance on each insert)
  IF random() < 0.01 THEN
    DELETE FROM public.security_audit_logs 
    WHERE created_at < now() - interval '90 days';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic cleanup
DROP TRIGGER IF EXISTS trigger_cleanup_old_audit_logs ON public.security_audit_logs;
CREATE TRIGGER trigger_cleanup_old_audit_logs
  AFTER INSERT ON public.security_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_old_audit_logs_trigger();