-- ============================================
-- REMOVE AUTHENTICATION AND COMMENTS SYSTEM (only what exists)
-- ============================================

-- Drop functions that still exist (CASCADE will handle dependencies)
DROP FUNCTION IF EXISTS public.user_can_comment(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_anonymized_profile(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_anonymized_comments() CASCADE;
DROP FUNCTION IF EXISTS public.get_visible_profile_data(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.is_authorized() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.auto_security_audit() CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_old_audit_logs() CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_old_audit_logs_trigger() CASCADE;
DROP FUNCTION IF EXISTS public.enhanced_security_audit(text, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.log_sensitive_operation(text, text, uuid, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.log_security_event(text, jsonb, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.security_audit_trigger() CASCADE;