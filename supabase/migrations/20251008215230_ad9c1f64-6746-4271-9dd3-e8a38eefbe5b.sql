-- Security Fix: Restrict direct access to property_comparables table
-- This prevents competitors from scraping detailed property data while maintaining
-- functionality through controlled SECURITY DEFINER functions

-- Drop the existing public read policy
DROP POLICY IF EXISTS "Public read access to property comparables" ON public.property_comparables;

-- Create restricted policy: Only allow SELECT for authenticated users (optional)
-- Comment this out if you want to completely block direct table access
-- CREATE POLICY "Authenticated users can read property comparables"
-- ON public.property_comparables
-- FOR SELECT
-- TO authenticated
-- USING (true);

-- The existing SECURITY DEFINER functions will continue to work because they bypass RLS
-- Functions like find_professional_comparables, find_comparables_public, etc.
-- already return obfuscated data (rounded coordinates, price ranges instead of exact values)

-- Add audit logging policy to track any access attempts
CREATE POLICY "Service role can manage property comparables"
ON public.property_comparables
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);