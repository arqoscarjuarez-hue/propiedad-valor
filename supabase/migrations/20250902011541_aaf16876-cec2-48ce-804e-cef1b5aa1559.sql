-- Professional USPAP-compliant comparable selection algorithm
-- Based on Fannie Mae guidelines and industry best practices
CREATE OR REPLACE FUNCTION public.find_professional_comparables(
  center_lat numeric,
  center_lng numeric,
  prop_type text,
  target_area numeric,
  target_bedrooms integer DEFAULT 0,
  target_bathrooms integer DEFAULT 0,
  target_age_years integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  address text,
  price_usd numeric,
  adjusted_price_usd numeric,
  price_per_sqm_usd numeric,
  adjusted_price_per_sqm numeric,
  total_area numeric,
  bedrooms integer,
  bathrooms integer,
  age_years integer,
  latitude numeric,
  longitude numeric,
  property_type text,
  estrato_social estrato_social,
  sale_date date,
  distance numeric,
  area_adjustment_factor numeric,
  time_adjustment_factor numeric,
  location_adjustment_factor numeric,
  condition_adjustment_factor numeric,
  overall_adjustment_factor numeric,
  net_adjustment_amount numeric,
  gross_adjustment_amount numeric,
  similarity_score numeric,
  months_old integer,
  selection_reason text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  market_factor numeric := 1.0;
  search_radius_km numeric := 1.0;
  max_radius_km numeric := 25.0;
  min_comparables integer := 3;
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
  LIMIT 5;  -- Professional standard: 3-5 comparables
END;
$$;