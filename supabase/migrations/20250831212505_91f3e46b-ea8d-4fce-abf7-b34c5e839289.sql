-- CORRECCIÓN CRÍTICA DE SEGURIDAD: Proteger datos sensibles de propiedades

-- 1. Eliminar la política pública actual que expone todos los datos
DROP POLICY IF EXISTS "Anyone can view property comparables" ON public.property_comparables;

-- 2. Crear una política que requiera autenticación para acceso completo
CREATE POLICY "Authenticated users can view property comparables"
ON public.property_comparables
FOR SELECT
TO authenticated
USING (true);

-- 3. Crear una vista pública con datos sanitizados para uso público
CREATE OR REPLACE VIEW public.property_comparables_public AS
SELECT 
  id,
  -- Direcciones anonimizadas (solo ciudad y estado)
  CONCAT(city, ', ', state, ', ', country) as general_location,
  -- Precios en rangos en lugar de valores exactos
  CASE 
    WHEN price_usd < 50000 THEN 'Menos de $50,000'
    WHEN price_usd < 100000 THEN '$50,000 - $100,000'
    WHEN price_usd < 200000 THEN '$100,000 - $200,000'
    WHEN price_usd < 300000 THEN '$200,000 - $300,000'
    WHEN price_usd < 500000 THEN '$300,000 - $500,000'
    ELSE 'Más de $500,000'
  END as price_range,
  -- Coordenadas con precisión reducida (redondeadas a 2 decimales)
  ROUND(latitude::numeric, 2) as approximate_latitude,
  ROUND(longitude::numeric, 2) as approximate_longitude,
  total_area,
  property_type,
  estrato_social,
  bedrooms,
  bathrooms,
  age_years
FROM public.property_comparables;

-- 4. Permitir acceso público solo a la vista sanitizada
CREATE POLICY "Anyone can view sanitized property data"
ON public.property_comparables_public
FOR SELECT
TO anon, authenticated
USING (true);

-- 5. Crear función segura para comparables que use datos sanitizados para usuarios no autenticados
CREATE OR REPLACE FUNCTION public.find_comparables_public(target_lat numeric, target_lng numeric, target_estrato estrato_social, target_property_type text DEFAULT NULL::text)
RETURNS TABLE(id uuid, general_location text, price_range text, total_area numeric, approximate_latitude numeric, approximate_longitude numeric, property_type text, estrato_social estrato_social, distance_km numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  chosen_radius NUMERIC := NULL;
  r NUMERIC;
  found_count INTEGER := 0;
BEGIN
  -- Validar entrada
  IF target_lat IS NULL OR target_lng IS NULL THEN
    RETURN;
  END IF;

  -- Radios progresivos en kilómetros
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

  -- Retornar datos sanitizados
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