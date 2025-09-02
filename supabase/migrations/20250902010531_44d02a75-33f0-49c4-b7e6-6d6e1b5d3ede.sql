-- Create function to find comparables with market-adjusted pricing
CREATE OR REPLACE FUNCTION public.find_market_adjusted_comparables(
  center_lat numeric,
  center_lng numeric,
  prop_type text,
  target_area numeric,
  target_price_range numeric DEFAULT 100000
)
RETURNS TABLE(
  id uuid,
  address text,
  price_usd numeric,
  adjusted_price_usd numeric,
  price_per_sqm_usd numeric,
  adjusted_price_per_sqm numeric,
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
  market_adjustment_factor numeric,
  months_old integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  market_factor numeric := 1.0;
  target_country text;
BEGIN
  -- Determine market adjustment factor based on location
  IF center_lat BETWEEN 13.0 AND 14.5 AND center_lng BETWEEN -90.5 AND -87.5 THEN
    -- El Salvador: Lower market prices
    market_factor := 0.35;  -- 35% of Mexico prices
    target_country := 'El Salvador';
  ELSIF center_lat BETWEEN 13.7 AND 17.8 AND center_lng BETWEEN -92.3 AND -88.2 THEN
    -- Guatemala: Moderate market prices  
    market_factor := 0.45;  -- 45% of Mexico prices
    target_country := 'Guatemala';
  ELSIF center_lat BETWEEN 12.9 AND 16.0 AND center_lng BETWEEN -89.4 AND -83.1 THEN
    -- Honduras: Lower market prices
    market_factor := 0.30;  -- 30% of Mexico prices
    target_country := 'Honduras';
  ELSE
    -- Mexico or other: No adjustment
    market_factor := 1.0;
    target_country := 'Mexico';
  END IF;

  RETURN QUERY
  WITH distance_calc AS (
    SELECT 
      pc.id,
      pc.address,
      pc.price_usd,
      ROUND(pc.price_usd * market_factor, 0) AS adjusted_price_usd,
      pc.price_per_sqm_usd,
      ROUND(pc.price_per_sqm_usd * market_factor, 0) AS adjusted_price_per_sqm,
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
      market_factor,
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
      -- Filter by adjusted price range (more realistic for local market)
      AND (pc.price_usd * market_factor) BETWEEN (target_price_range * 0.5) AND (target_price_range * 2.0)
  ),
  with_scores AS (
    SELECT 
      dc.*,
      -- Area similarity score
      CASE 
        WHEN target_area = 0 THEN 0.5
        WHEN dc.area_difference <= target_area * 0.15 THEN 1.0  -- Within 15%
        WHEN dc.area_difference <= target_area * 0.25 THEN 0.9  -- Within 25%
        WHEN dc.area_difference <= target_area * 0.35 THEN 0.8  -- Within 35%
        WHEN dc.area_difference <= target_area * 0.50 THEN 0.6  -- Within 50%
        ELSE GREATEST(0.3, 1 - (dc.area_difference / target_area))
      END AS area_similarity_score,
      -- Distance score
      CASE 
        WHEN dc.distance_km <= 3 THEN 1.0
        WHEN dc.distance_km <= 8 THEN 0.8
        WHEN dc.distance_km <= 15 THEN 0.6
        WHEN dc.distance_km <= 25 THEN 0.4
        ELSE 0.2
      END AS distance_score,
      -- Price proximity score (new)
      CASE 
        WHEN ABS(dc.adjusted_price_usd - target_price_range) <= target_price_range * 0.2 THEN 1.0
        WHEN ABS(dc.adjusted_price_usd - target_price_range) <= target_price_range * 0.4 THEN 0.8
        WHEN ABS(dc.adjusted_price_usd - target_price_range) <= target_price_range * 0.6 THEN 0.6
        ELSE 0.4
      END AS price_score,
      -- Recency score
      CASE 
        WHEN dc.months_old <= 6 THEN 1.0
        WHEN dc.months_old <= 12 THEN 0.9
        WHEN dc.months_old <= 18 THEN 0.8
        WHEN dc.months_old <= 24 THEN 0.6
        ELSE 0.4
      END AS recency_score
    FROM distance_calc dc
    WHERE dc.distance_km <= 25  -- Extended radius for better results
  )
  SELECT 
    ws.id,
    ws.address,
    ws.price_usd,
    ws.adjusted_price_usd,
    ws.price_per_sqm_usd,
    ws.adjusted_price_per_sqm,
    ws.total_area,
    ws.latitude,
    ws.longitude,
    ws.property_type,
    ws.estrato_social,
    ws.sale_date,
    ws.distance_km,
    ws.area_difference,
    ws.area_similarity_score,
    -- Enhanced scoring: area (40%) + price (30%) + distance (20%) + recency (10%)
    ROUND(
      CAST(
        (ws.area_similarity_score * 0.4 + ws.price_score * 0.3 + ws.distance_score * 0.2 + ws.recency_score * 0.1) AS NUMERIC
      ), 3
    ) AS overall_similarity_score,
    ws.market_factor,
    ws.months_old
  FROM with_scores ws
  ORDER BY 
    overall_similarity_score DESC,
    ws.area_similarity_score DESC,
    ws.distance_km ASC
  LIMIT 5;
END;
$$;