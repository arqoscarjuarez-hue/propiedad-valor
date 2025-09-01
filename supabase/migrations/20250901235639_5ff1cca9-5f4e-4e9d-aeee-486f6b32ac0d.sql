-- Ensure only the correct signature exists and matches what Edge Function calls
DROP FUNCTION IF EXISTS public.find_comparables_within_radius(numeric, numeric, numeric, text);
DROP FUNCTION IF EXISTS public.find_comparables_within_radius(double precision, double precision, double precision, text);
DROP FUNCTION IF EXISTS public.find_comparables_within_radius(real, real, real, text);
DROP FUNCTION IF EXISTS public.find_comparables_within_radius(numeric, numeric, text, numeric);
DROP FUNCTION IF EXISTS public.find_comparables_within_radius(double precision, double precision, text, double precision);
DROP FUNCTION IF EXISTS public.find_comparables_within_radius(real, real, text, real);

-- Create function to find comparables within a radius by location and property type only
CREATE OR REPLACE FUNCTION public.find_comparables_within_radius(
  center_lat numeric,
  center_lng numeric,
  property_type text,
  radius_km numeric
)
RETURNS TABLE (
  id uuid,
  address text,
  price_usd numeric,
  price_per_sqm_usd numeric,
  total_area numeric,
  latitude numeric,
  longitude numeric,
  property_type text,
  estrato_social public.estrato_social,
  distance numeric
) AS $$
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
    pc.property_type = find_comparables_within_radius.property_type
    AND pc.latitude IS NOT NULL 
    AND pc.longitude IS NOT NULL
    AND pc.latitude BETWEEN -90 AND 90
    AND pc.longitude BETWEEN -180 AND 180
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;