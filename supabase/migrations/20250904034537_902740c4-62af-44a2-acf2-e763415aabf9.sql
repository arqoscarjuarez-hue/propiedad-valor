-- Fix security warnings: Set search_path for existing functions

-- Update existing functions to have proper search_path
CREATE OR REPLACE FUNCTION public.is_authorized()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.authorized_users au
    WHERE au.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.authorized_users au
    WHERE au.user_id = auth.uid()
    AND au.created_by IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_market_factor(detected_country text, prop_type text)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SET search_path = 'public'
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

CREATE OR REPLACE FUNCTION public.detect_country(center_lat numeric, center_lng numeric)
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path = 'public'
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