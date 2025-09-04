-- Fix database function search paths - Critical Security Fix
-- This prevents potential SQL injection through search_path manipulation

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.email
  );
  RETURN NEW;
END;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Create enhanced input validation functions with security improvements
CREATE OR REPLACE FUNCTION public.validate_coordinates_secure(lat numeric, lng numeric)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Enhanced coordinate validation with bounds checking
    IF lat IS NULL OR lng IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Validate latitude range with tighter bounds
    IF lat < -85 OR lat > 85 THEN
        RETURN FALSE;
    END IF;
    
    -- Validate longitude range
    IF lng < -180 OR lng > 180 THEN
        RETURN FALSE;
    END IF;
    
    -- Additional validation for reasonable coordinate precision
    IF ABS(lat) > 0 AND ABS(lat) < 0.000001 THEN
        RETURN FALSE;
    END IF;
    
    IF ABS(lng) > 0 AND ABS(lng) < 0.000001 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$function$;

-- Create secure audit logging function for security events
CREATE OR REPLACE FUNCTION public.log_security_event(
    event_type text,
    event_details jsonb DEFAULT NULL,
    user_id_param uuid DEFAULT NULL
)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
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
$function$;

-- Create comment privacy enhancement function
CREATE OR REPLACE FUNCTION public.get_anonymized_comments()
 RETURNS TABLE(
    id uuid,
    content text,
    created_at timestamp with time zone,
    is_approved boolean,
    anonymous_author text
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.content,
        c.created_at,
        c.is_approved,
        CASE 
            WHEN c.user_id IS NOT NULL THEN 'Usuario Anónimo'
            ELSE 'Sistema'
        END as anonymous_author
    FROM public.comments c
    WHERE c.is_approved = true
    ORDER BY c.created_at DESC;
END;
$function$;

-- Add security monitoring triggers
CREATE OR REPLACE FUNCTION public.security_audit_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    -- Log security-relevant operations
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'comments' THEN
        PERFORM public.log_security_event(
            'comment_created',
            jsonb_build_object(
                'comment_id', NEW.id,
                'moderation_status', NEW.moderation_status,
                'table', TG_TABLE_NAME
            )
        );
    END IF;
    
    IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'profiles' THEN
        PERFORM public.log_security_event(
            'profile_updated',
            jsonb_build_object(
                'profile_id', NEW.id,
                'table', TG_TABLE_NAME
            )
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create security monitoring triggers
CREATE TRIGGER security_audit_comments
    AFTER INSERT ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION public.security_audit_trigger();

CREATE TRIGGER security_audit_profiles
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.security_audit_trigger();