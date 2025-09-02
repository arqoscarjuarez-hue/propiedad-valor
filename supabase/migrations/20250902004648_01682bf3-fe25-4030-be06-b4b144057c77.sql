-- Drop existing functions and recreate with new signature
DROP FUNCTION IF EXISTS public.find_comparables_within_radius(numeric,numeric,text,numeric);
DROP FUNCTION IF EXISTS public.find_best_comparables(numeric,numeric,text,numeric,numeric);

-- 1) find_comparables_within_radius: add sale_date filter and return column
CREATE OR REPLACE FUNCTION public.find_comparables_within_radius(
  center_lat numeric,
  center_lng numeric,
  prop_type text,
  radius_km numeric
)
RETURNS TABLE(
  id uuid,
  address text,
  price_usd numeric,
  price_per_sqm_usd numeric,
  total_area numeric,
  latitude numeric,
  longitude numeric,
  property_type text,
  estrato_social estrato_social,
  sale_date date,
  distance numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
  LIMIT 5;
END;
$$;

-- 2) find_best_comparables: add sale_date filter and return column
CREATE OR REPLACE FUNCTION public.find_best_comparables(
  center_lat numeric,
  center_lng numeric,
  prop_type text,
  target_area numeric,
  max_distance_km numeric DEFAULT 50
)
RETURNS TABLE(
  id uuid,
  address text,
  price_usd numeric,
  price_per_sqm_usd numeric,
  total_area numeric,
  latitude numeric,
  longitude numeric,
  property_type text,
  estrato_social estrato_social,
  sale_date date,
  distance numeric,
  area_similarity_score numeric,
  overall_similarity_score numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH distance_calc AS (
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
      ) AS distance_km
    FROM public.property_comparables pc
    WHERE 
      pc.property_type = prop_type
      AND pc.latitude IS NOT NULL 
      AND pc.longitude IS NOT NULL
      AND pc.latitude BETWEEN -90 AND 90
      AND pc.longitude BETWEEN -180 AND 180
      AND pc.price_usd IS NOT NULL
      AND pc.price_per_sqm_usd IS NOT NULL
      AND pc.total_area IS NOT NULL
      AND pc.price_usd > 0
      AND pc.price_per_sqm_usd > 0
      AND pc.total_area > 0
      AND pc.sale_date BETWEEN CURRENT_DATE - INTERVAL '18 months' AND CURRENT_DATE
  ),
  with_scores AS (
    SELECT 
      dc.*,
      CASE 
        WHEN target_area = 0 THEN 0.5
        ELSE GREATEST(0, 1 - ABS(dc.total_area - target_area) / GREATEST(dc.total_area, target_area))
      END AS area_similarity_score,
      CASE 
        WHEN dc.distance_km <= 1 THEN 1.0
        WHEN dc.distance_km <= 5 THEN 0.8
        WHEN dc.distance_km <= 10 THEN 0.6
        WHEN dc.distance_km <= 20 THEN 0.4
        ELSE 0.2
      END AS distance_score
    FROM distance_calc dc
    WHERE dc.distance_km <= max_distance_km
  )
  SELECT 
    ws.id,
    ws.address,
    ws.price_usd,
    ws.price_per_sqm_usd,
    ws.total_area,
    ws.latitude,
    ws.longitude,
    ws.property_type,
    ws.estrato_social,
    ws.sale_date,
    ws.distance_km,
    ws.area_similarity_score,
    ROUND(
      CAST(
        (ws.area_similarity_score * 0.6 + ws.distance_score * 0.4) AS NUMERIC
      ), 3
    ) AS overall_similarity_score
  FROM with_scores ws
  ORDER BY 
    overall_similarity_score DESC,
    ws.distance_km ASC,
    ws.area_similarity_score DESC
  LIMIT 5;
END;
$$;