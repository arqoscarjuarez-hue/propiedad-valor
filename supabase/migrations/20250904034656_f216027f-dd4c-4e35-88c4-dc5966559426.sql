-- Fix all remaining functions with search_path - comprehensive update

CREATE OR REPLACE FUNCTION public.find_comparables_progressive_radius(target_lat numeric, target_lng numeric, target_estrato estrato_social, target_property_type text DEFAULT NULL::text)
RETURNS TABLE(id uuid, address text, price_usd numeric, price_per_sqm_usd numeric, total_area numeric, latitude numeric, longitude numeric, property_type text, estrato_social estrato_social, distance_km numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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

CREATE OR REPLACE FUNCTION public.find_comparables_within_radius(center_lat numeric, center_lng numeric, prop_type text, radius_km numeric)
RETURNS TABLE(id uuid, address text, price_usd numeric, price_per_sqm_usd numeric, total_area numeric, latitude numeric, longitude numeric, property_type text, estrato_social estrato_social, sale_date date, distance numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
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
    ) AS distance
  FROM public.property_comparables pc
  WHERE 
    pc.property_type = prop_type
    AND pc.latitude IS NOT NULL 
    AND pc.longitude IS NOT NULL
    AND pc.latitude BETWEEN -90 AND 90
    AND pc.longitude BETWEEN -180 AND 180
    AND pc.sale_date BETWEEN CURRENT_DATE - INTERVAL '18 months' AND CURRENT_DATE
    AND 6371 * acos(
      cos(radians(center_lat)) * 
      cos(radians(pc.latitude)) * 
      cos(radians(pc.longitude) - radians(center_lng)) + 
      sin(radians(center_lat)) * 
      sin(radians(pc.latitude))
    ) <= radius_km
  ORDER BY distance ASC
  LIMIT 10;
END;
$$;