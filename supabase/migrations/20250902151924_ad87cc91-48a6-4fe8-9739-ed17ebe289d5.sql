-- Tighten access to sensitive comparables data without breaking existing functionality
-- 1) Remove overly-permissive policy
DROP POLICY IF EXISTS "Authenticated users can view property comparables" ON public.property_comparables;

-- 2) Create allowlist table for authorized users
CREATE TABLE IF NOT EXISTS public.authorized_users (
  user_id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

-- Enable RLS on allowlist table (default: no access)
ALTER TABLE public.authorized_users ENABLE ROW LEVEL SECURITY;

-- Optional: allow users to see only their authorization row (no insert/update/delete by default)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'authorized_users' 
      AND policyname = 'Users can view their own authorization row'
  ) THEN
    CREATE POLICY "Users can view their own authorization row"
    ON public.authorized_users
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
  END IF;
END $$;

-- 3) Helper function to check authorization inside RLS (security definer)
CREATE OR REPLACE FUNCTION public.is_authorized()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.authorized_users au
    WHERE au.user_id = auth.uid()
  );
$$;

-- 4) Restrictive SELECT policy on property_comparables based on allowlist
CREATE POLICY "Authorized users can view property comparables"
ON public.property_comparables
FOR SELECT
TO authenticated
USING (public.is_authorized());

-- Notes:
-- - No other commands (INSERT/UPDATE/DELETE) are enabled on property_comparables
-- - SECURITY DEFINER functions already in this project can continue to read the table
--   without exposing raw data to clients, preserving existing functionality.