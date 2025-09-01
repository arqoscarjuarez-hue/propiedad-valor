-- Create function to find comparables within a radius by location and property type only
CREATE OR REPLACE FUNCTION find_comparables_within_radius(
  center_lat FLOAT,
  center_lng FLOAT,
  radius_km FLOAT,
  property_type TEXT
)
RETURNS TABLE (
  id UUID,
  property_type TEXT,
  total_area NUMERIC,
  price_per_m2 NUMERIC,
  total_price NUMERIC,
  location TEXT,
  distance_km FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.id,
    pc.property_type,
    pc.total_area,
    pc.price_per_m2,
    pc.total_price,
    pc.location,
    -- Calculate distance using Haversine formula
    (6371 * acos(
      cos(radians(center_lat)) * 
      cos(radians(pc.latitude)) * 
      cos(radians(pc.longitude) - radians(center_lng)) + 
      sin(radians(center_lat)) * 
      sin(radians(pc.latitude))
    )) as distance_km
  FROM property_comparables pc
  WHERE 
    pc.property_type = find_comparables_within_radius.property_type
    AND pc.latitude IS NOT NULL 
    AND pc.longitude IS NOT NULL
    AND (6371 * acos(
      cos(radians(center_lat)) * 
      cos(radians(pc.latitude)) * 
      cos(radians(pc.longitude) - radians(center_lng)) + 
      sin(radians(center_lat)) * 
      sin(radians(pc.latitude))
    )) <= radius_km
  ORDER BY distance_km ASC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;