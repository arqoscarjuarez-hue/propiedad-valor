-- ============================================================================
-- Fix Security Issue: Protect Audit Logs from Unauthorized Access
-- ============================================================================

-- Add SELECT policy to restrict access to audit logs
-- Only service role (administrators) can read audit logs
CREATE POLICY "Only service role can read audit logs"
ON public.api_access_logs
FOR SELECT
TO service_role
USING (true);

-- Add comment explaining the security rationale
COMMENT ON TABLE public.api_access_logs IS 
'Stores API access logs including IP addresses and user agents for monitoring and security analysis. Access restricted to service role only to protect user privacy and prevent profiling attacks.';