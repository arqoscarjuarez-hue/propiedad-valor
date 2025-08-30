-- Create enum for social strata (estratos sociales latinoamericanos)
CREATE TYPE public.estrato_social AS ENUM (
  'alto_alto',
  'alto_medio', 
  'alto_bajo',
  'medio_alto',
  'medio_medio',
  'medio_bajo',
  'bajo_alto',
  'bajo_medio',
  'bajo_bajo'
);

-- Add social stratum column to property_comparables
ALTER TABLE public.property_comparables 
ADD COLUMN estrato_social public.estrato_social DEFAULT 'medio_medio';

-- Add index for better performance when filtering by social stratum
CREATE INDEX idx_property_comparables_estrato_social 
ON public.property_comparables(estrato_social);

-- Add some sample data with social strata for testing
UPDATE public.property_comparables 
SET estrato_social = CASE 
  WHEN price_per_sqm_usd > 2500 THEN 'alto_alto'::estrato_social
  WHEN price_per_sqm_usd > 2000 THEN 'alto_medio'::estrato_social
  WHEN price_per_sqm_usd > 1800 THEN 'alto_bajo'::estrato_social
  WHEN price_per_sqm_usd > 1500 THEN 'medio_alto'::estrato_social
  WHEN price_per_sqm_usd > 1200 THEN 'medio_medio'::estrato_social
  WHEN price_per_sqm_usd > 900 THEN 'medio_bajo'::estrato_social
  WHEN price_per_sqm_usd > 600 THEN 'bajo_alto'::estrato_social
  WHEN price_per_sqm_usd > 400 THEN 'bajo_medio'::estrato_social
  ELSE 'bajo_bajo'::estrato_social
END;

-- Create function to find comparables with progressive radius search
-- Following Latin American valuation standards (UPAV, IVSC)
CREATE OR REPLACE FUNCTION public.find_comparables_progressive_radius(
  target_lat NUMERIC,
  target_lng NUMERIC,
  target_estrato public.estrato_social,
  target_property_type TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  address TEXT,
  price_usd NUMERIC,
  price_per_sqm_usd NUMERIC,
  total_area NUMERIC,
  latitude NUMERIC,
  longitude NUMERIC,
  property_type TEXT,
  estrato_social public.estrato_social,
  distance_km NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  radius_km NUMERIC;
  found_count INTEGER;
  min_required INTEGER := 3;
BEGIN
  -- Progressive radius search: 1km, 3km, 5km, 10km, 20km, 50km
  -- Following Latin American valuation standards for comparable properties
  FOR radius_km IN SELECT unnest(ARRAY[1, 3, 5, 10, 20, 50]) LOOP
    
    RETURN QUERY
    SELECT 
      pc.id,
      pc.address,
      pc.price_usd,
      pc.price_per_sqm_usd,
      pc.total_area,
      pc.latitude,
      pc.longitude,
      pc.property_type,
      pc.estrato_social,
      -- Haversine distance calculation
      ROUND(
        CAST(
          6371 * acos(
            cos(radians(target_lat)) * 
            cos(radians(pc.latitude)) * 
            cos(radians(pc.longitude) - radians(target_lng)) + 
            sin(radians(target_lat)) * 
            sin(radians(pc.latitude))
          ) AS NUMERIC
        ), 2
      ) AS distance_km
    FROM public.property_comparables pc
    WHERE 
      -- Same social stratum (required by Latin American valuation standards)
      pc.estrato_social = target_estrato
      -- Property type filter (optional, if specified)
      AND (target_property_type IS NULL OR pc.property_type = target_property_type)
      -- Within current radius
      AND 6371 * acos(
        cos(radians(target_lat)) * 
        cos(radians(pc.latitude)) * 
        cos(radians(pc.longitude) - radians(target_lng)) + 
        sin(radians(target_lat)) * 
        sin(radians(pc.latitude))
      ) <= radius_km
      -- Valid coordinates
      AND pc.latitude IS NOT NULL 
      AND pc.longitude IS NOT NULL
      AND pc.latitude BETWEEN -90 AND 90
      AND pc.longitude BETWEEN -180 AND 180
    ORDER BY 
      -- Prioritize closer properties
      6371 * acos(
        cos(radians(target_lat)) * 
        cos(radians(pc.latitude)) * 
        cos(radians(pc.longitude) - radians(target_lng)) + 
        sin(radians(target_lat)) * 
        sin(radians(pc.latitude))
      ) ASC
    LIMIT 5;
    
    -- Check if we found enough comparables
    GET DIAGNOSTICS found_count = ROW_COUNT;
    
    IF found_count >= min_required THEN
      -- We found enough comparables at this radius, exit loop
      EXIT;
    END IF;
    
  END LOOP;
  
  RETURN;
END;
$$;