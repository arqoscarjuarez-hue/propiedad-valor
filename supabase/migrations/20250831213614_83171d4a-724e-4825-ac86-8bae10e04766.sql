-- FIX MIGRATION ERROR AND APPLY SECURITY CHANGES SAFELY

-- 1) Remove public SELECT policy on base table (if exists)
DROP POLICY IF EXISTS "Anyone can view property comparables" ON public.property_comparables;

-- Ensure RLS is enabled on the base table
ALTER TABLE public.property_comparables ENABLE ROW LEVEL SECURITY;

-- 2) Restrict full access to authenticated users only
CREATE POLICY IF NOT EXISTS "Authenticated users can view property comparables"
ON public.property_comparables
FOR SELECT
TO authenticated
USING (true);

-- 3) Create a sanitized public VIEW (no policies on views)
CREATE OR REPLACE VIEW public.property_comparables_public AS
SELECT 
  id,
  CONCAT(city, ', ', state, ', ', country) as general_location,
  CASE 
    WHEN price_usd < 50000 THEN 'Menos de $50,000'
    WHEN price_usd < 100000 THEN '$50,000 - $100,000'
    WHEN price_usd < 200000 THEN '$100,000 - $200,000'
    WHEN price_usd < 300000 THEN '$200,000 - $300,000'
    WHEN price_usd < 500000 THEN '$300,000 - $500,000'
    ELSE 'Más de $500,000'
  END as price_range,
  ROUND(latitude::numeric, 2) as approximate_latitude,
  ROUND(longitude::numeric, 2) as approximate_longitude,
  total_area,
  property_type,
  estrato_social,
  bedrooms,
  bathrooms,
  age_years
FROM public.property_comparables;

-- 4) Create a SECURITY DEFINER RPC that returns sanitized comparables for public use
CREATE OR REPLACE FUNCTION public.find_comparables_public(
  target_lat numeric,
  target_lng numeric,
  target_estrato estrato_social,
  target_property_type text DEFAULT NULL::text
)
RETURNS TABLE(
  id uuid,
  general_location text,
  price_range text,
  total_area numeric,
  approximate_latitude numeric,
  approximate_longitude numeric,
  property_type text,
  estrato_social estrato_social,
  distance_km numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  chosen_radius NUMERIC := NULL;
  r NUMERIC;
  found_count INTEGER := 0;
BEGIN
  IF target_lat IS NULL OR target_lng IS NULL THEN
    RETURN;
  END IF;

  FOR r IN SELECT unnest(ARRAY[1, 3, 5, 10, 20, 50]) LOOP
    SELECT count(*) INTO found_count
    FROM public.property_comparables pc
    WHERE pc.estrato_social = target_estrato
      AND (target_property_type IS NULL OR pc.property_type = target_property_type)
      AND pc.latitude IS NOT NULL AND pc.longitude IS NOT NULL
      AND pc.latitude BETWEEN -90 AND 90
      AND pc.longitude BETWEEN -180 AND 180
      AND 6371 * acos(
        cos(radians(target_lat)) * 
        cos(radians(pc.latitude)) * 
        cos(radians(pc.longitude) - radians(target_lng)) + 
        sin(radians(target_lat)) * 
        sin(radians(pc.latitude))
      ) <= r;

    IF found_count >= 3 THEN
      chosen_radius := r;
      EXIT;
    END IF;
  END LOOP;

  IF chosen_radius IS NULL THEN
    chosen_radius := 50;
  END IF;

  RETURN QUERY
  SELECT 
    pc.id,
    CONCAT(pc.city, ', ', pc.state, ', ', pc.country) as general_location,
    CASE 
      WHEN pc.price_usd < 50000 THEN 'Menos de $50,000'
      WHEN pc.price_usd < 100000 THEN '$50,000 - $100,000'
      WHEN pc.price_usd < 200000 THEN '$100,000 - $200,000'
      WHEN pc.price_usd < 300000 THEN '$200,000 - $300,000'
      WHEN pc.price_usd < 500000 THEN '$300,000 - $500,000'
      ELSE 'Más de $500,000'
    END as price_range,
    pc.total_area,
    ROUND(CAST(pc.latitude AS NUMERIC), 2) as approximate_latitude,
    ROUND(CAST(pc.longitude AS NUMERIC), 2) as approximate_longitude,
    pc.property_type,
    pc.estrato_social,
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
  WHERE pc.estrato_social = target_estrato
    AND (target_property_type IS NULL OR pc.property_type = target_property_type)
    AND pc.latitude IS NOT NULL AND pc.longitude IS NOT NULL
    AND pc.latitude BETWEEN -90 AND 90
    AND pc.longitude BETWEEN -180 AND 180
    AND 6371 * acos(
      cos(radians(target_lat)) * 
      cos(radians(pc.latitude)) * 
      cos(radians(pc.longitude) - radians(target_lng)) + 
      sin(radians(target_lat)) * 
      sin(radians(pc.latitude))
    ) <= chosen_radius
  ORDER BY distance_km ASC
  LIMIT 5;
END;
$function$;

-- 5) Allow public and authenticated to call the sanitized RPC
GRANT EXECUTE ON FUNCTION public.find_comparables_public(numeric, numeric, estrato_social, text) TO anon, authenticated;

-- (Optional) Ensure the existing precise RPC remains callable (avoid breaking current UI)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'find_comparables_progressive_radius'
  ) THEN
    GRANT EXECUTE ON FUNCTION public.find_comparables_progressive_radius(numeric, numeric, estrato_social, text) TO anon, authenticated;
  END IF;
END $$;