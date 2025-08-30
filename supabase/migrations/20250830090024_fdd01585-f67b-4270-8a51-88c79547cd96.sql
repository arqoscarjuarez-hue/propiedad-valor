-- Create or replace function for progressive radius comparables by social stratum
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
  chosen_radius NUMERIC := NULL;
  r NUMERIC;
  found_count INTEGER := 0;
BEGIN
  -- Validate input
  IF target_lat IS NULL OR target_lng IS NULL THEN
    RETURN;
  END IF;

  -- Progressive radii in kilometers
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

  -- If still null, return what is available within the largest radius (may be 0 results)
  IF chosen_radius IS NULL THEN
    chosen_radius := 50; -- maximum search radius
  END IF;

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
$$;