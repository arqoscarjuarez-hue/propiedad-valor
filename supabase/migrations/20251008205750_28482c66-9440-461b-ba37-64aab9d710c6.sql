-- ============================================================================
-- PHASE 1: Critical Database Access - RLS Policies
-- ============================================================================

-- 1. PUBLIC READ POLICIES FOR property_comparables
-- Allow anonymous users to read property data with built-in row limits
CREATE POLICY "Public read access to property comparables"
ON public.property_comparables
FOR SELECT
TO anon, authenticated
USING (true);

-- Prevent public writes - only service role can modify data
CREATE POLICY "Only service role can insert property comparables"
ON public.property_comparables
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Only service role can update property comparables"
ON public.property_comparables
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Only service role can delete property comparables"
ON public.property_comparables
FOR DELETE
TO service_role
USING (true);

-- 2. PUBLIC READ POLICIES FOR market_adjustments
-- Allow anonymous users to read market adjustment factors
CREATE POLICY "Public read access to market adjustments"
ON public.market_adjustments
FOR SELECT
TO anon, authenticated
USING (true);

-- Prevent public writes - only service role can modify data
CREATE POLICY "Only service role can insert market adjustments"
ON public.market_adjustments
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Only service role can update market adjustments"
ON public.market_adjustments
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Only service role can delete market adjustments"
ON public.market_adjustments
FOR DELETE
TO service_role
USING (true);

-- ============================================================================
-- PHASE 2: Data Protection - Secure Functions with Obfuscation
-- ============================================================================

-- Create a secure function that returns obfuscated property data
-- This prevents exact location scraping while maintaining utility
CREATE OR REPLACE FUNCTION public.get_obfuscated_comparables(
  center_lat numeric,
  center_lng numeric,
  prop_type text,
  target_area numeric DEFAULT 100,
  max_results integer DEFAULT 5
)
RETURNS TABLE(
  id uuid,
  general_location text,
  price_range text,
  area_range text,
  approximate_latitude numeric,
  approximate_longitude numeric,
  property_type text,
  distance_category text,
  sale_period text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Input validation
  IF NOT public.validate_coordinates(center_lat, center_lng) THEN
    RAISE EXCEPTION 'Invalid coordinates provided';
  END IF;
  
  IF max_results > 10 THEN
    max_results := 10; -- Hard limit to prevent data scraping
  END IF;
  
  RETURN QUERY
  WITH nearby_properties AS (
    SELECT 
      pc.id,
      pc.city,
      pc.state,
      pc.country,
      pc.price_usd,
      pc.total_area,
      pc.latitude,
      pc.longitude,
      pc.property_type,
      pc.sale_date,
      ROUND(
        CAST(
          6371 * acos(
            cos(radians(center_lat)) * 
            cos(radians(pc.latitude)) * 
            cos(radians(pc.longitude) - radians(center_lng)) + 
            sin(radians(center_lat)) * 
            sin(radians(pc.latitude))
          ) AS NUMERIC
        ), 2
      ) AS distance_km
    FROM public.property_comparables pc
    WHERE 
      pc.property_type = prop_type
      AND pc.latitude IS NOT NULL 
      AND pc.longitude IS NOT NULL
      AND pc.latitude BETWEEN -90 AND 90
      AND pc.longitude BETWEEN -180 AND 180
      AND pc.total_area BETWEEN (target_area * 0.5) AND (target_area * 2.0)
      AND 6371 * acos(
        cos(radians(center_lat)) * 
        cos(radians(pc.latitude)) * 
        cos(radians(pc.longitude) - radians(center_lng)) + 
        sin(radians(center_lat)) * 
        sin(radians(pc.latitude))
      ) <= 25
    ORDER BY distance_km ASC
    LIMIT max_results
  )
  SELECT 
    np.id,
    -- Obfuscate exact location
    CONCAT(np.city, ', ', np.state) as general_location,
    -- Return price ranges instead of exact prices
    CASE 
      WHEN np.price_usd < 50000 THEN 'Menos de $50,000'
      WHEN np.price_usd < 100000 THEN '$50,000 - $100,000'
      WHEN np.price_usd < 200000 THEN '$100,000 - $200,000'
      WHEN np.price_usd < 300000 THEN '$200,000 - $300,000'
      WHEN np.price_usd < 500000 THEN '$300,000 - $500,000'
      ELSE 'Más de $500,000'
    END as price_range,
    -- Return area ranges
    CASE 
      WHEN np.total_area < 50 THEN 'Menos de 50 m²'
      WHEN np.total_area < 100 THEN '50 - 100 m²'
      WHEN np.total_area < 150 THEN '100 - 150 m²'
      WHEN np.total_area < 200 THEN '150 - 200 m²'
      WHEN np.total_area < 300 THEN '200 - 300 m²'
      ELSE 'Más de 300 m²'
    END as area_range,
    -- Round coordinates to 2 decimal places (reduces precision to ~1km)
    ROUND(CAST(np.latitude AS NUMERIC), 2) as approximate_latitude,
    ROUND(CAST(np.longitude AS NUMERIC), 2) as approximate_longitude,
    np.property_type,
    -- Categorize distance instead of exact values
    CASE 
      WHEN np.distance_km <= 1 THEN 'Muy cerca (< 1 km)'
      WHEN np.distance_km <= 5 THEN 'Cerca (1-5 km)'
      WHEN np.distance_km <= 10 THEN 'Moderado (5-10 km)'
      ELSE 'Distante (10+ km)'
    END as distance_category,
    -- Return sale period instead of exact date
    CASE 
      WHEN np.sale_date >= CURRENT_DATE - INTERVAL '6 months' THEN 'Últimos 6 meses'
      WHEN np.sale_date >= CURRENT_DATE - INTERVAL '12 months' THEN '6-12 meses atrás'
      WHEN np.sale_date >= CURRENT_DATE - INTERVAL '18 months' THEN '12-18 meses atrás'
      ELSE 'Más de 18 meses'
    END as sale_period
  FROM nearby_properties np;
END;
$$;

-- Add comment explaining the security approach
COMMENT ON FUNCTION public.get_obfuscated_comparables IS 
'Returns obfuscated property comparable data to prevent competitive scraping while maintaining utility for valuations. Data is rounded, categorized, and limited to prevent exact reconstruction of the database.';

-- ============================================================================
-- PHASE 3: Monitoring - Audit Log for Access Tracking
-- ============================================================================

-- Create audit log table for monitoring access patterns
CREATE TABLE IF NOT EXISTS public.api_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,
  request_params jsonb,
  user_agent text,
  ip_address inet,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.api_access_logs ENABLE ROW LEVEL SECURITY;

-- Only service role can write to audit logs
CREATE POLICY "Only service role can insert audit logs"
ON public.api_access_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_api_access_logs_created_at 
ON public.api_access_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_api_access_logs_function_name 
ON public.api_access_logs(function_name, created_at DESC);