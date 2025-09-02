-- Update function to prioritize by area similarity first, then distance
CREATE OR REPLACE FUNCTION public.find_area_prioritized_comparables(
  center_lat numeric,
  center_lng numeric,
  prop_type text,
  target_area numeric,
  max_distance_km numeric DEFAULT 15
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
  area_difference numeric,
  area_similarity_score numeric,
  overall_similarity_score numeric,
  months_old integer
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
      ) AS distance_km,
      ABS(pc.total_area - target_area) AS area_difference,
      EXTRACT(MONTH FROM AGE(CURRENT_DATE, pc.sale_date))::integer AS months_old
    FROM public.property_comparables pc
    WHERE 
      -- Flexible property type matching
      (pc.property_type = prop_type OR 
       (prop_type = 'casa' AND pc.property_type IN ('casa', 'vivienda', 'residencial')) OR
       (prop_type = 'apartamento' AND pc.property_type IN ('apartamento', 'condominio', 'piso')))
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
      AND pc.sale_date >= CURRENT_DATE - INTERVAL '36 months'
  ),
  with_scores AS (
    SELECT 
      dc.*,
      -- PRIORITY: Area similarity score (highest weight)
      CASE 
        WHEN target_area = 0 THEN 0.5
        WHEN dc.area_difference <= target_area * 0.1 THEN 1.0  -- Within 10%
        WHEN dc.area_difference <= target_area * 0.2 THEN 0.9  -- Within 20%
        WHEN dc.area_difference <= target_area * 0.3 THEN 0.8  -- Within 30%
        WHEN dc.area_difference <= target_area * 0.5 THEN 0.6  -- Within 50%
        ELSE GREATEST(0.2, 1 - (dc.area_difference / target_area))
      END AS area_similarity_score,
      -- Distance score (secondary)
      CASE 
        WHEN dc.distance_km <= 2 THEN 1.0
        WHEN dc.distance_km <= 5 THEN 0.8
        WHEN dc.distance_km <= 10 THEN 0.6
        WHEN dc.distance_km <= 15 THEN 0.4
        ELSE 0.2
      END AS distance_score,
      -- Recency score (tertiary)
      CASE 
        WHEN dc.months_old <= 6 THEN 1.0
        WHEN dc.months_old <= 12 THEN 0.9
        WHEN dc.months_old <= 18 THEN 0.8
        WHEN dc.months_old <= 24 THEN 0.6
        ELSE 0.4
      END AS recency_score
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
    ws.area_difference,
    ws.area_similarity_score,
    -- Combined score: AREA FIRST (70%), then distance (20%), then recency (10%)
    ROUND(
      CAST(
        (ws.area_similarity_score * 0.7 + ws.distance_score * 0.2 + ws.recency_score * 0.1) AS NUMERIC
      ), 3
    ) AS overall_similarity_score,
    ws.months_old
  FROM with_scores ws
  ORDER BY 
    -- PRIMARY: Area similarity first
    ws.area_similarity_score DESC,
    -- SECONDARY: Overall similarity score
    overall_similarity_score DESC,
    -- TERTIARY: Distance
    ws.distance_km ASC
  LIMIT 3;  -- Only top 3 most area-similar
END;
$$;