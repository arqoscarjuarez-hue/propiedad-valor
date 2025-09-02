-- Create a flexible comparables search function based on professional methodology
CREATE OR REPLACE FUNCTION public.find_flexible_comparables(
  center_lat numeric,
  center_lng numeric,
  prop_type text,
  target_area numeric,
  max_distance_km numeric DEFAULT 10
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
      EXTRACT(MONTH FROM AGE(CURRENT_DATE, pc.sale_date))::integer AS months_old
    FROM public.property_comparables pc
    WHERE 
      -- More flexible property type matching
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
      -- More flexible time range: prefer recent but allow older if needed
      AND pc.sale_date >= CURRENT_DATE - INTERVAL '36 months'
  ),
  with_scores AS (
    SELECT 
      dc.*,
      -- Area similarity: more tolerant ranges
      CASE 
        WHEN target_area = 0 THEN 0.7
        WHEN ABS(dc.total_area - target_area) / GREATEST(dc.total_area, target_area) <= 0.3 THEN 1.0
        WHEN ABS(dc.total_area - target_area) / GREATEST(dc.total_area, target_area) <= 0.5 THEN 0.8
        WHEN ABS(dc.total_area - target_area) / GREATEST(dc.total_area, target_area) <= 0.8 THEN 0.6
        ELSE 0.4
      END AS area_similarity_score,
      -- Distance score
      CASE 
        WHEN dc.distance_km <= 2 THEN 1.0
        WHEN dc.distance_km <= 5 THEN 0.9
        WHEN dc.distance_km <= 8 THEN 0.7
        WHEN dc.distance_km <= 15 THEN 0.5
        ELSE 0.3
      END AS distance_score,
      -- Recency score (prefer newer sales)
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
    ws.area_similarity_score,
    -- Combined similarity score
    ROUND(
      CAST(
        (ws.area_similarity_score * 0.4 + ws.distance_score * 0.4 + ws.recency_score * 0.2) AS NUMERIC
      ), 3
    ) AS overall_similarity_score,
    ws.months_old
  FROM with_scores ws
  ORDER BY 
    overall_similarity_score DESC,
    ws.distance_km ASC,
    ws.months_old ASC
  LIMIT 10;
END;
$$;