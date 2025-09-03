-- 1) Tabla de factores de mercado configurable
CREATE TABLE IF NOT EXISTS public.market_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  property_type TEXT NOT NULL DEFAULT 'any',
  factor NUMERIC NOT NULL CHECK (factor > 0),
  source TEXT,
  notes TEXT,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unicidad por país/tipo (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS ux_market_adjustments_country_type
ON public.market_adjustments (lower(country), lower(property_type));

-- Activar RLS y políticas
ALTER TABLE public.market_adjustments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'market_adjustments' AND policyname = 'Authorized users can read market adjustments'
  ) THEN
    CREATE POLICY "Authorized users can read market adjustments"
      ON public.market_adjustments
      FOR SELECT
      USING (public.is_authorized());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'market_adjustments' AND policyname = 'Only admins can insert market adjustments'
  ) THEN
    CREATE POLICY "Only admins can insert market adjustments"
      ON public.market_adjustments
      FOR INSERT
      WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'market_adjustments' AND policyname = 'Only admins can update market adjustments'
  ) THEN
    CREATE POLICY "Only admins can update market adjustments"
      ON public.market_adjustments
      FOR UPDATE
      USING (public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'market_adjustments' AND policyname = 'Only admins can delete market adjustments'
  ) THEN
    CREATE POLICY "Only admins can delete market adjustments"
      ON public.market_adjustments
      FOR DELETE
      USING (public.is_admin());
  END IF;
END $$;

-- Trigger updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_market_adjustments_updated_at'
  ) THEN
    CREATE TRIGGER trg_market_adjustments_updated_at
      BEFORE UPDATE ON public.market_adjustments
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 2) Semilla inicial de factores para LATAM (provisionales, ajustables)
-- Evitar duplicados si ya existe el país
INSERT INTO public.market_adjustments (country, property_type, factor, source, notes)
SELECT * FROM (
  VALUES
    ('LATAM_DEFAULT','any',1.00,'seed','Default global para LATAM'),
    ('Mexico','any',1.00,'seed','Base de referencia'),
    ('Argentina','any',0.60,'seed','Provisional'),
    ('Bolivia','any',0.50,'seed','Provisional'),
    ('Brazil','any',1.20,'seed','Provisional'),
    ('Chile','any',1.40,'seed','Provisional'),
    ('Colombia','any',0.90,'seed','Provisional'),
    ('Costa Rica','any',1.10,'seed','Provisional'),
    ('Cuba','any',0.80,'seed','Provisional'),
    ('Dominican Republic','any',0.90,'seed','Provisional'),
    ('Ecuador','any',0.80,'seed','Provisional'),
    ('El Salvador','any',0.35,'seed','Coherente con heurística previa'),
    ('Guatemala','any',0.45,'seed','Coherente con heurística previa'),
    ('Haiti','any',0.60,'seed','Provisional'),
    ('Honduras','any',0.30,'seed','Coherente con heurística previa'),
    ('Nicaragua','any',0.50,'seed','Provisional'),
    ('Panama','any',1.20,'seed','Provisional'),
    ('Paraguay','any',0.70,'seed','Provisional'),
    ('Peru','any',1.00,'seed','Provisional'),
    ('Uruguay','any',1.50,'seed','Provisional'),
    ('Venezuela','any',0.30,'seed','Provisional (alta volatilidad)'),
    ('Belize','any',1.10,'seed','Provisional'),
    ('Puerto Rico','any',1.60,'seed','Provisional')
) AS s(country, property_type, factor, source, notes)
WHERE NOT EXISTS (
  SELECT 1 FROM public.market_adjustments m
  WHERE lower(m.country) = lower(s.country) AND lower(m.property_type) = lower(s.property_type)
);

-- 3) Función helper: detectar país por bounding box (aproximado)
CREATE OR REPLACE FUNCTION public.detect_country(center_lat numeric, center_lng numeric)
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
DECLARE
  c text := 'LATAM_DEFAULT';
BEGIN
  -- Centroamérica y Caribe
  IF center_lat BETWEEN 13.0 AND 14.5 AND center_lng BETWEEN -90.5 AND -87.5 THEN RETURN 'El Salvador'; END IF;
  IF center_lat BETWEEN 13.7 AND 17.8 AND center_lng BETWEEN -92.3 AND -88.2 THEN RETURN 'Guatemala'; END IF;
  IF center_lat BETWEEN 12.9 AND 16.0 AND center_lng BETWEEN -89.4 AND -83.1 THEN RETURN 'Honduras'; END IF;
  IF center_lat BETWEEN 10.7 AND 15.0 AND center_lng BETWEEN -87.7 AND -83.1 THEN RETURN 'Nicaragua'; END IF;
  IF center_lat BETWEEN 8.0 AND 11.3 AND center_lng BETWEEN -85.9 AND -82.5 THEN RETURN 'Costa Rica'; END IF;
  IF center_lat BETWEEN 7.2 AND 9.7 AND center_lng BETWEEN -83.0 AND -77.2 THEN RETURN 'Panama'; END IF;
  IF center_lat BETWEEN 17.9 AND 18.6 AND center_lng BETWEEN -67.3 AND -65.2 THEN RETURN 'Puerto Rico'; END IF;
  IF center_lat BETWEEN 19.8 AND 23.5 AND center_lng BETWEEN -85.0 AND -74.1 THEN RETURN 'Cuba'; END IF;
  IF center_lat BETWEEN 18.0 AND 20.1 AND center_lng BETWEEN -74.5 AND -71.6 THEN RETURN 'Haiti'; END IF;
  IF center_lat BETWEEN 17.5 AND 19.9 AND center_lng BETWEEN -72.0 AND -68.3 THEN RETURN 'Dominican Republic'; END IF;
  IF center_lat BETWEEN 15.9 AND 18.5 AND center_lng BETWEEN -89.2 AND -87.5 THEN RETURN 'Belize'; END IF;

  -- México
  IF center_lat BETWEEN 14.4 AND 32.7 AND center_lng BETWEEN -118.5 AND -86.7 THEN RETURN 'Mexico'; END IF;

  -- Sudamérica
  IF center_lat BETWEEN -5.0 AND 1.7 AND center_lng BETWEEN -81.1 AND -75.2 THEN RETURN 'Ecuador'; END IF;
  IF center_lat BETWEEN -18.4 AND 0.0 AND center_lng BETWEEN -81.4 AND -68.7 THEN RETURN 'Peru'; END IF;
  IF center_lat BETWEEN -22.9 AND -9.7 AND center_lng BETWEEN -69.6 AND -57.5 THEN RETURN 'Bolivia'; END IF;
  IF center_lat BETWEEN -55.9 AND -17.5 AND center_lng BETWEEN -75.6 AND -66.4 THEN RETURN 'Chile'; END IF;
  IF center_lat BETWEEN -55.1 AND -21.8 AND center_lng BETWEEN -73.6 AND -53.6 THEN RETURN 'Argentina'; END IF;
  IF center_lat BETWEEN -35.0 AND -30.1 AND center_lng BETWEEN -58.5 AND -53.2 THEN RETURN 'Uruguay'; END IF;
  IF center_lat BETWEEN -27.6 AND -19.3 AND center_lng BETWEEN -62.7 AND -54.2 THEN RETURN 'Paraguay'; END IF;
  IF center_lat BETWEEN -33.8 AND 5.4 AND center_lng BETWEEN -73.9 AND -34.8 THEN RETURN 'Brazil'; END IF;
  IF center_lat BETWEEN -4.2 AND 13.5 AND center_lng BETWEEN -79.0 AND -66.9 THEN RETURN 'Colombia'; END IF;
  IF center_lat BETWEEN 0.6 AND 12.2 AND center_lng BETWEEN -73.4 AND -59.8 THEN RETURN 'Venezuela'; END IF;

  RETURN c; -- LATAM_DEFAULT
END;
$$;

-- 4) Utilidad para obtener factor desde la tabla, con fallback por tipo
CREATE OR REPLACE FUNCTION public.get_market_factor(detected_country text, prop_type text)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
DECLARE
  f numeric;
BEGIN
  -- Intentar coincidencia exacta país + tipo
  SELECT ma.factor INTO f
  FROM public.market_adjustments ma
  WHERE lower(ma.country) = lower(detected_country)
    AND lower(ma.property_type) = lower(prop_type)
  ORDER BY ma.updated_at DESC
  LIMIT 1;

  IF f IS NOT NULL THEN RETURN f; END IF;

  -- Fallback: país + 'any'
  SELECT ma.factor INTO f
  FROM public.market_adjustments ma
  WHERE lower(ma.country) = lower(detected_country)
    AND lower(ma.property_type) = 'any'
  ORDER BY ma.updated_at DESC
  LIMIT 1;

  IF f IS NOT NULL THEN RETURN f; END IF;

  -- Fallback: LATAM_DEFAULT
  SELECT ma.factor INTO f
  FROM public.market_adjustments ma
  WHERE lower(ma.country) = 'latam_default' AND lower(ma.property_type) = 'any'
  LIMIT 1;

  RETURN COALESCE(f, 1.0);
END;
$$;

-- 5) Actualizar funciones para usar el nuevo esquema de factores

CREATE OR REPLACE FUNCTION public.find_market_adjusted_comparables(center_lat numeric, center_lng numeric, prop_type text, target_area numeric, target_price_range numeric DEFAULT 100000)
RETURNS TABLE(
  id uuid, address text, price_usd numeric, adjusted_price_usd numeric, price_per_sqm_usd numeric, adjusted_price_per_sqm numeric,
  total_area numeric, latitude numeric, longitude numeric, property_type text, estrato_social estrato_social, sale_date date,
  distance numeric, area_difference numeric, area_similarity_score numeric, overall_similarity_score numeric, market_adjustment_factor numeric, months_old integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  market_factor numeric := 1.0;
  country text := public.detect_country(center_lat, center_lng);
BEGIN
  market_factor := public.get_market_factor(country, prop_type);

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
      AND (pc.price_usd * market_factor) BETWEEN (target_price_range * 0.5) AND (target_price_range * 2.0)
  ),
  with_scores AS (
    SELECT 
      dc.*,
      CASE 
        WHEN target_area = 0 THEN 0.5
        WHEN dc.area_difference <= target_area * 0.15 THEN 1.0
        WHEN dc.area_difference <= target_area * 0.25 THEN 0.9
        WHEN dc.area_difference <= target_area * 0.35 THEN 0.8
        WHEN dc.area_difference <= target_area * 0.50 THEN 0.6
        ELSE GREATEST(0.3, 1 - (dc.area_difference / target_area))
      END AS area_similarity_score,
      CASE 
        WHEN dc.distance_km <= 3 THEN 1.0
        WHEN dc.distance_km <= 8 THEN 0.8
        WHEN dc.distance_km <= 15 THEN 0.6
        WHEN dc.distance_km <= 25 THEN 0.4
        ELSE 0.2
      END AS distance_score,
      CASE 
        WHEN ABS(dc.adjusted_price_usd - target_price_range) <= target_price_range * 0.2 THEN 1.0
        WHEN ABS(dc.adjusted_price_usd - target_price_range) <= target_price_range * 0.4 THEN 0.8
        WHEN ABS(dc.adjusted_price_usd - target_price_range) <= target_price_range * 0.6 THEN 0.6
        ELSE 0.4
      END AS price_score,
      CASE 
        WHEN dc.months_old <= 6 THEN 1.0
        WHEN dc.months_old <= 12 THEN 0.9
        WHEN dc.months_old <= 18 THEN 0.8
        WHEN dc.months_old <= 24 THEN 0.6
        ELSE 0.4
      END AS recency_score
    FROM distance_calc dc
    WHERE dc.distance_km <= 25
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
    ROUND(
      CAST(
        (ws.area_similarity_score * 0.4 + ws.price_score * 0.3 + ws.distance_score * 0.2 + ws.recency_score * 0.1) AS NUMERIC
      ), 3
    ) AS overall_similarity_score,
    market_factor,
    ws.months_old
  FROM with_scores ws
  ORDER BY 
    overall_similarity_score DESC,
    ws.area_similarity_score DESC,
    ws.distance_km ASC
  LIMIT 4;
END;
$$;

CREATE OR REPLACE FUNCTION public.find_exact_type_comparables(center_lat numeric, center_lng numeric, prop_type text, target_area numeric, target_price_range numeric DEFAULT 100000)
RETURNS TABLE(
  id uuid, address text, price_usd numeric, adjusted_price_usd numeric, price_per_sqm_usd numeric, adjusted_price_per_sqm numeric,
  total_area numeric, latitude numeric, longitude numeric, property_type text, estrato_social estrato_social, sale_date date, distance numeric,
  area_difference numeric, area_similarity_score numeric, type_match_score numeric, overall_similarity_score numeric, market_adjustment_factor numeric, months_old integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  market_factor numeric := 1.0;
  country text := public.detect_country(center_lat, center_lng);
  exact_matches_count integer := 0;
BEGIN
  market_factor := public.get_market_factor(country, prop_type);

  SELECT COUNT(*) INTO exact_matches_count
  FROM public.property_comparables pc
  WHERE pc.property_type = prop_type
    AND pc.latitude IS NOT NULL 
    AND pc.longitude IS NOT NULL
    AND pc.price_usd IS NOT NULL
    AND pc.total_area IS NOT NULL
    AND pc.sale_date >= CURRENT_DATE - INTERVAL '36 months';

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
      EXTRACT(MONTH FROM AGE(CURRENT_DATE, pc.sale_date))::integer AS months_old,
      CASE 
        WHEN pc.property_type = prop_type THEN 1.0
        WHEN (prop_type = 'casa' AND pc.property_type IN ('vivienda', 'residencial')) THEN 0.8
        WHEN (prop_type = 'apartamento' AND pc.property_type IN ('condominio', 'piso')) THEN 0.8
        WHEN (prop_type = 'terreno' AND pc.property_type IN ('lote', 'solar')) THEN 0.8
        WHEN (prop_type = 'local_comercial' AND pc.property_type IN ('comercial', 'oficina')) THEN 0.8
        ELSE 0.5
      END AS type_match_score
    FROM public.property_comparables pc
    WHERE 
      (exact_matches_count >= 3 AND pc.property_type = prop_type)
      OR
      (exact_matches_count < 3 AND (
        pc.property_type = prop_type OR 
        (prop_type = 'casa' AND pc.property_type IN ('casa', 'vivienda', 'residencial')) OR
        (prop_type = 'apartamento' AND pc.property_type IN ('apartamento', 'condominio', 'piso')) OR
        (prop_type = 'terreno' AND pc.property_type IN ('terreno', 'lote', 'solar')) OR
        (prop_type = 'local_comercial' AND pc.property_type IN ('local_comercial', 'comercial', 'oficina'))
      ))
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
      AND (pc.price_usd * market_factor) BETWEEN (target_price_range * 0.3) AND (target_price_range * 3.0)
  ),
  with_scores AS (
    SELECT 
      dc.*,
      CASE 
        WHEN target_area = 0 THEN 0.5
        WHEN dc.area_difference <= target_area * 0.15 THEN 1.0
        WHEN dc.area_difference <= target_area * 0.25 THEN 0.9
        WHEN dc.area_difference <= target_area * 0.35 THEN 0.8
        WHEN dc.area_difference <= target_area * 0.50 THEN 0.6
        ELSE GREATEST(0.3, 1 - (dc.area_difference / target_area))
      END AS area_similarity_score,
      CASE 
        WHEN dc.distance_km <= 3 THEN 1.0
        WHEN dc.distance_km <= 8 THEN 0.8
        WHEN dc.distance_km <= 15 THEN 0.6
        WHEN dc.distance_km <= 25 THEN 0.4
        ELSE 0.2
      END AS distance_score,
      CASE 
        WHEN ABS(dc.adjusted_price_usd - target_price_range) <= target_price_range * 0.2 THEN 1.0
        WHEN ABS(dc.adjusted_price_usd - target_price_range) <= target_price_range * 0.4 THEN 0.8
        WHEN ABS(dc.adjusted_price_usd - target_price_range) <= target_price_range * 0.6 THEN 0.6
        ELSE 0.4
      END AS price_score,
      CASE 
        WHEN dc.months_old <= 6 THEN 1.0
        WHEN dc.months_old <= 12 THEN 0.9
        WHEN dc.months_old <= 18 THEN 0.8
        WHEN dc.months_old <= 24 THEN 0.6
        ELSE 0.4
      END AS recency_score
    FROM distance_calc dc
    WHERE dc.distance_km <= 30
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
    ws.type_match_score,
    ROUND(
      CAST(
        (ws.type_match_score * 0.5 + ws.area_similarity_score * 0.25 + ws.price_score * 0.15 + ws.distance_score * 0.1) AS NUMERIC
      ), 3
    ) AS overall_similarity_score,
    market_factor,
    ws.months_old
  FROM with_scores ws
  ORDER BY 
    ws.type_match_score DESC,
    overall_similarity_score DESC,
    ws.distance_km ASC
  LIMIT 5;
END;
$$;

CREATE OR REPLACE FUNCTION public.find_professional_comparables(center_lat numeric, center_lng numeric, prop_type text, target_area numeric, target_bedrooms integer DEFAULT 0, target_bathrooms integer DEFAULT 0, target_age_years integer DEFAULT 0)
RETURNS TABLE(
  id uuid, address text, price_usd numeric, adjusted_price_usd numeric, price_per_sqm_usd numeric, adjusted_price_per_sqm numeric,
  total_area numeric, bedrooms integer, bathrooms integer, age_years integer, latitude numeric, longitude numeric, property_type text,
  estrato_social estrato_social, sale_date date, distance numeric, area_adjustment_factor numeric, time_adjustment_factor numeric,
  location_adjustment_factor numeric, condition_adjustment_factor numeric, overall_adjustment_factor numeric, net_adjustment_amount numeric,
  gross_adjustment_amount numeric, similarity_score numeric, months_old integer, selection_reason text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  market_factor numeric := 1.0;
  search_radius_km numeric := 1.0;
  max_radius_km numeric := 25.0;
  min_comparables integer := 4;
  found_count integer := 0;
  country text := public.detect_country(center_lat, center_lng);
BEGIN
  market_factor := public.get_market_factor(country, prop_type);

  WHILE found_count < min_comparables AND search_radius_km <= max_radius_km LOOP
    SELECT COUNT(*) INTO found_count
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
      AND (target_bathrooms = 0 OR ABS(COALESCE(pc.bathrooms, 0) - target_bathrooms) <= 1);

    IF found_count < min_comparables THEN
      IF search_radius_km < 2 THEN
        search_radius_km := 2;
      ELSIF search_radius_km < 5 THEN
        search_radius_km := 5;
      ELSIF search_radius_km < 10 THEN
        search_radius_km := 10;
      ELSIF search_radius_km < 25 THEN
        search_radius_km := 25;
      ELSE
        EXIT;
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
      CASE 
        WHEN ABS(cs.total_area - target_area) <= target_area * 0.05 THEN 1.00
        WHEN ABS(cs.total_area - target_area) <= target_area * 0.10 THEN 0.98
        WHEN ABS(cs.total_area - target_area) <= target_area * 0.15 THEN 0.95
        WHEN ABS(cs.total_area - target_area) <= target_area * 0.25 THEN 0.90
        ELSE 0.85
      END AS area_adjustment_factor,
      CASE 
        WHEN cs.months_old <= 3 THEN 1.00
        WHEN cs.months_old <= 6 THEN 0.99
        WHEN cs.months_old <= 12 THEN 0.97
        WHEN cs.months_old <= 18 THEN 0.94
        ELSE 0.90
      END AS time_adjustment_factor,
      CASE 
        WHEN cs.distance_km <= 1 THEN 1.00
        WHEN cs.distance_km <= 3 THEN 0.98
        WHEN cs.distance_km <= 5 THEN 0.95
        WHEN cs.distance_km <= 10 THEN 0.92
        ELSE 0.88
      END AS location_adjustment_factor,
      CASE 
        WHEN target_age_years = 0 THEN 1.00
        WHEN ABS(cs.age_years - target_age_years) <= 2 THEN 1.00
        WHEN ABS(cs.age_years - target_age_years) <= 5 THEN 0.97
        WHEN ABS(cs.age_years - target_age_years) <= 10 THEN 0.94
        ELSE 0.90
      END AS condition_adjustment_factor
    FROM comparable_sales cs
  ),
  final_adjustments AS (
    SELECT 
      wa.*,
      (wa.area_adjustment_factor * wa.time_adjustment_factor * 
       wa.location_adjustment_factor * wa.condition_adjustment_factor) AS overall_adjustment_factor,
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
    ROUND(fa.adjusted_price_usd * (1 - fa.overall_adjustment_factor), 0) AS net_adjustment_amount,
    ROUND(ABS(fa.adjusted_price_usd * (1 - fa.area_adjustment_factor)) + 
          ABS(fa.adjusted_price_usd * (1 - fa.time_adjustment_factor)) + 
          ABS(fa.adjusted_price_usd * (1 - fa.location_adjustment_factor)) + 
          ABS(fa.adjusted_price_usd * (1 - fa.condition_adjustment_factor)), 0) AS gross_adjustment_amount,
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
    fa.overall_adjustment_factor DESC,
    fa.distance_km ASC,
    fa.months_old ASC
  LIMIT 4;
END;
$$;