-- Allow authenticated users to insert into security_audit_logs so triggers can log events without failing RLS
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'security_audit_logs' AND policyname = 'Authenticated can insert audit logs'
  ) THEN
    CREATE POLICY "Authenticated can insert audit logs"
    ON public.security_audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;