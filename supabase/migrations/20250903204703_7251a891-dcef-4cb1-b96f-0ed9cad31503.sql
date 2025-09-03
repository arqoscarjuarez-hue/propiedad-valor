-- Actualizar las funciones de comparables para usar 4 comparables en lugar de 3 o 5

-- Actualizar la función de comparables profesionales para retornar 4 comparables
CREATE OR REPLACE FUNCTION public.find_professional_comparables(center_lat numeric, center_lng numeric, prop_type text, target_area numeric, target_bedrooms integer DEFAULT 0, target_bathrooms integer DEFAULT 0, target_age_years integer DEFAULT 0)
 RETURNS TABLE(id uuid, address text, price_usd numeric, adjusted_price_usd numeric, price_per_sqm_usd numeric, adjusted_price_per_sqm numeric, total_area numeric, bedrooms integer, bathrooms integer, age_years integer, latitude numeric, longitude numeric, property_type text, estrato_social estrato_social, sale_date date, distance numeric, area_adjustment_factor numeric, time_adjustment_factor numeric, location_adjustment_factor numeric, condition_adjustment_factor numeric, overall_adjustment_factor numeric, net_adjustment_amount numeric, gross_adjustment_amount numeric, similarity_score numeric, months_old integer, selection_reason text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  market_factor numeric := 1.0;
  search_radius_km numeric := 1.0;
  max_radius_km numeric := 25.0;
  min_comparables integer := 4;  -- Cambiado de 3 a 4
  found_count integer := 0;
BEGIN
  -- Market adjustment factor based on location (El Salvador context)
  IF center_lat BETWEEN 13.0 AND 14.5 AND center_lng BETWEEN -90.5 AND -87.5 THEN
    market_factor := 0.35;  -- El Salvador market adjustment
  ELSIF center_lat BETWEEN 13.7 AND 17.8 AND center_lng BETWEEN -92.3 AND -88.2 THEN
    market_factor := 0.45;  -- Guatemala
  ELSIF center_lat BETWEEN 12.9 AND 16.0 AND center_lng BETWEEN -89.4 AND -83.1 THEN
    market_factor := 0.30;  -- Honduras
  ELSE
    market_factor := 1.0;   -- Mexico/Other
  END IF;

  -- Professional Search Algorithm: Expand radius until minimum comparables found
  WHILE found_count < min_comparables AND search_radius_km <= max_radius_km LOOP
    SELECT COUNT(*) INTO found_count
    FROM public.property_comparables pc
    WHERE 
      -- CRITERION 1: EXACT PROPERTY TYPE MATCH (Most Important)
      pc.property_type = prop_type
      AND pc.latitude IS NOT NULL 
      AND pc.longitude IS NOT NULL
      AND pc.price_usd IS NOT NULL
      AND pc.total_area IS NOT NULL
      AND pc.sale_date >= CURRENT_DATE - INTERVAL '24 months'  -- USPAP: Recent sales preferred
      AND 6371 * acos(
        cos(radians(center_lat)) * 
        cos(radians(pc.latitude)) * 
        cos(radians(pc.longitude) - radians(center_lng)) + 
        sin(radians(center_lat)) * 
        sin(radians(pc.latitude))
      ) <= search_radius_km
      -- CRITERION 2: Area within reasonable range (USPAP: ±25% preferred, ±50% acceptable)
      AND pc.total_area BETWEEN (target_area * 0.5) AND (target_area * 1.5)
      -- CRITERION 3: Bedroom count within ±1 (if provided)
      AND (target_bedrooms = 0 OR ABS(COALESCE(pc.bedrooms, 0) - target_bedrooms) <= 1)
      -- CRITERION 4: Bathroom count within ±1 (if provided)  
      AND (target_bathrooms = 0 OR ABS(COALESCE(pc.bathrooms, 0) - target_bathrooms) <= 1);

    -- If not enough found, expand radius using professional standards
    IF found_count < min_comparables THEN
      IF search_radius_km < 2 THEN
        search_radius_km := 2;    -- Urban: 2km
      ELSIF search_radius_km < 5 THEN
        search_radius_km := 5;    -- Suburban: 5km
      ELSIF search_radius_km < 10 THEN
        search_radius_km := 10;   -- Rural: 10km
      ELSIF search_radius_km < 25 THEN
        search_radius_km := 25;   -- Extended: 25km
      ELSE
        EXIT; -- No more expansion possible
      END IF;
    END IF;
  END LOOP;

  RETURN QUERY
  WITH comparable_sales AS (
    SELECT 
      pc.id,
      pc.address,
      pc.price_usd,
      ROUND(pc.price_usd * market_factor, 0) AS adjusted_price_usd,
      pc.price_per_sqm_usd,
      ROUND(pc.price_per_sqm_usd * market_factor, 0) AS adjusted_price_per_sqm,
      pc.total_area,
      COALESCE(pc.bedrooms, 0) AS bedrooms,
      COALESCE(pc.bathrooms, 0) AS bathrooms,
      COALESCE(pc.age_years, 0) AS age_years,
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
      EXTRACT(MONTH FROM AGE(CURRENT_DATE, pc.sale_date))::integer AS months_old,
      search_radius_km AS final_search_radius
    FROM public.property_comparables pc
    WHERE 
      pc.property_type = prop_type
      AND pc.latitude IS NOT NULL 
      AND pc.longitude IS NOT NULL
      AND pc.price_usd IS NOT NULL
      AND pc.total_area IS NOT NULL
      AND pc.sale_date >= CURRENT_DATE - INTERVAL '24 months'
      AND 6371 * acos(
        cos(radians(center_lat)) * 
        cos(radians(pc.latitude)) * 
        cos(radians(pc.longitude) - radians(center_lng)) + 
        sin(radians(center_lat)) * 
        sin(radians(pc.latitude))
      ) <= search_radius_km
      AND pc.total_area BETWEEN (target_area * 0.5) AND (target_area * 1.5)
      AND (target_bedrooms = 0 OR ABS(COALESCE(pc.bedrooms, 0) - target_bedrooms) <= 1)
      AND (target_bathrooms = 0 OR ABS(COALESCE(pc.bathrooms, 0) - target_bathrooms) <= 1)
  ),
  with_adjustments AS (
    SELECT 
      cs.*,
      -- PROFESSIONAL ADJUSTMENT FACTORS (Based on USPAP/Fannie Mae Standards)
      
      -- Area Adjustment Factor
      CASE 
        WHEN ABS(cs.total_area - target_area) <= target_area * 0.05 THEN 1.00  -- ±5%: No adjustment
        WHEN ABS(cs.total_area - target_area) <= target_area * 0.10 THEN 0.98  -- ±10%: 2% adjustment
        WHEN ABS(cs.total_area - target_area) <= target_area * 0.15 THEN 0.95  -- ±15%: 5% adjustment
        WHEN ABS(cs.total_area - target_area) <= target_area * 0.25 THEN 0.90  -- ±25%: 10% adjustment
        ELSE 0.85  -- >25%: 15% adjustment
      END AS area_adjustment_factor,
      
      -- Time Adjustment Factor (Market appreciation/depreciation)
      CASE 
        WHEN cs.months_old <= 3 THEN 1.00   -- 0-3 months: No adjustment
        WHEN cs.months_old <= 6 THEN 0.99   -- 4-6 months: 1% adjustment
        WHEN cs.months_old <= 12 THEN 0.97  -- 7-12 months: 3% adjustment
        WHEN cs.months_old <= 18 THEN 0.94  -- 13-18 months: 6% adjustment
        ELSE 0.90  -- 19-24 months: 10% adjustment
      END AS time_adjustment_factor,
      
      -- Location Adjustment Factor (Distance-based)
      CASE 
        WHEN cs.distance_km <= 1 THEN 1.00   -- ≤1km: No adjustment
        WHEN cs.distance_km <= 3 THEN 0.98   -- 1-3km: 2% adjustment
        WHEN cs.distance_km <= 5 THEN 0.95   -- 3-5km: 5% adjustment
        WHEN cs.distance_km <= 10 THEN 0.92  -- 5-10km: 8% adjustment
        ELSE 0.88  -- >10km: 12% adjustment
      END AS location_adjustment_factor,
      
      -- Condition Adjustment Factor (Age-based proxy)
      CASE 
        WHEN target_age_years = 0 THEN 1.00  -- No age data
        WHEN ABS(cs.age_years - target_age_years) <= 2 THEN 1.00   -- ±2 years: No adjustment
        WHEN ABS(cs.age_years - target_age_years) <= 5 THEN 0.97   -- ±5 years: 3% adjustment
        WHEN ABS(cs.age_years - target_age_years) <= 10 THEN 0.94  -- ±10 years: 6% adjustment
        ELSE 0.90  -- >10 years: 10% adjustment
      END AS condition_adjustment_factor
    FROM comparable_sales cs
  ),
  final_adjustments AS (
    SELECT 
      wa.*,
      -- Overall Combined Adjustment Factor
      (wa.area_adjustment_factor * wa.time_adjustment_factor * 
       wa.location_adjustment_factor * wa.condition_adjustment_factor) AS overall_adjustment_factor,
      
      -- Selection Reason
      CASE 
        WHEN wa.distance_km <= wa.final_search_radius * 0.3 THEN 'Optimal: Close proximity & exact type match'
        WHEN wa.distance_km <= wa.final_search_radius * 0.6 THEN 'Good: Moderate distance & exact type match'
        ELSE 'Acceptable: Extended search for minimum comparables'
      END AS selection_reason
    FROM with_adjustments wa
  )
  SELECT 
    fa.id,
    fa.address,
    fa.price_usd,
    fa.adjusted_price_usd,
    fa.price_per_sqm_usd,
    fa.adjusted_price_per_sqm,
    fa.total_area,
    fa.bedrooms,
    fa.bathrooms,
    fa.age_years,
    fa.latitude,
    fa.longitude,
    fa.property_type,
    fa.estrato_social,
    fa.sale_date,
    fa.distance_km,
    fa.area_adjustment_factor,
    fa.time_adjustment_factor,
    fa.location_adjustment_factor,
    fa.condition_adjustment_factor,
    fa.overall_adjustment_factor,
    -- Net and Gross Adjustments (Professional Standards)
    ROUND(fa.adjusted_price_usd * (1 - fa.overall_adjustment_factor), 0) AS net_adjustment_amount,
    ROUND(ABS(fa.adjusted_price_usd * (1 - fa.area_adjustment_factor)) + 
          ABS(fa.adjusted_price_usd * (1 - fa.time_adjustment_factor)) + 
          ABS(fa.adjusted_price_usd * (1 - fa.location_adjustment_factor)) + 
          ABS(fa.adjusted_price_usd * (1 - fa.condition_adjustment_factor)), 0) AS gross_adjustment_amount,
    -- Professional Similarity Score (0-100)
    ROUND(
      CAST(
        (fa.area_adjustment_factor * 0.40 + 
         fa.time_adjustment_factor * 0.25 + 
         fa.location_adjustment_factor * 0.25 + 
         fa.condition_adjustment_factor * 0.10) * 100 AS NUMERIC
      ), 1
    ) AS similarity_score,
    fa.months_old,
    fa.selection_reason
  FROM final_adjustments fa
  ORDER BY 
    -- USPAP Priority: Best adjusted comparables first
    fa.overall_adjustment_factor DESC,  -- Least adjustments needed
    fa.distance_km ASC,                 -- Closest distance
    fa.months_old ASC                   -- Most recent sales
  LIMIT 4;  -- Cambiar de 5 a 4 comparables
END;
$function$;

-- Actualizar también la función de comparables con ajuste de mercado para usar 4 comparables
CREATE OR REPLACE FUNCTION public.find_market_adjusted_comparables(center_lat numeric, center_lng numeric, prop_type text, target_area numeric, target_price_range numeric DEFAULT 100000)
 RETURNS TABLE(id uuid, address text, price_usd numeric, adjusted_price_usd numeric, price_per_sqm_usd numeric, adjusted_price_per_sqm numeric, total_area numeric, latitude numeric, longitude numeric, property_type text, estrato_social estrato_social, sale_date date, distance numeric, area_difference numeric, area_similarity_score numeric, overall_similarity_score numeric, market_adjustment_factor numeric, months_old integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  LIMIT 4;  -- Cambiar de 5 a 4 comparables
END;
$function$;