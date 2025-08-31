-- CORREGIR PROBLEMA CRÍTICO: Security Definer View
-- El problema es que la vista property_comparables_public puede ignorar RLS

-- 1) Eliminar la vista problemática
DROP VIEW IF EXISTS public.property_comparables_public;

-- 2) En lugar de una vista, crear una función RPC que sea más segura
-- Esta función ya existe (find_comparables_public) y es la forma correcta de exponer datos sanitizados

-- 3) Crear una función adicional para obtener datos públicos de forma controlada
CREATE OR REPLACE FUNCTION public.get_property_comparables_public(
  limit_rows integer DEFAULT 50,
  offset_rows integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  general_location text,
  price_range text,
  total_area numeric,
  approximate_latitude numeric,
  approximate_longitude numeric,
  property_type text,
  estrato_social estrato_social
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Limitar el número de filas que se pueden obtener por llamada
  IF limit_rows > 100 THEN
    limit_rows := 100;
  END IF;

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
    pc.estrato_social
  FROM public.property_comparables pc
  WHERE pc.latitude IS NOT NULL 
    AND pc.longitude IS NOT NULL
    AND pc.latitude BETWEEN -90 AND 90
    AND pc.longitude BETWEEN -180 AND 180
  ORDER BY pc.created_at DESC
  LIMIT limit_rows
  OFFSET offset_rows;
END;
$function$;