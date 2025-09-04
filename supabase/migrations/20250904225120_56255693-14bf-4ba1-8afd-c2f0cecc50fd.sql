-- ============================================================================
-- CORRECCIÓN ADICIONAL: FIJAR search_path EN validate_coordinates (linter)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_coordinates(lat numeric, lng numeric)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Validate latitude range
    IF lat IS NULL OR lat < -90 OR lat > 90 THEN
        RETURN FALSE;
    END IF;
    
    -- Validate longitude range  
    IF lng IS NULL OR lng < -180 OR lng > 180 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$;

-- ============================================================================