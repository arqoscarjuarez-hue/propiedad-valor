-- Fix duplicate policies warning
-- Remove any remaining old policies that might conflict
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;

-- Ensure only the secure policy exists
-- The 'Authenticated users can create comments' policy is already in place and secure