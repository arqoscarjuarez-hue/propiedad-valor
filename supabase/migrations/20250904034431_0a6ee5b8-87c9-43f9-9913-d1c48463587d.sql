-- Add rate limiting and audit logging tables for enhanced security

-- Table to track comment creation attempts for rate limiting
CREATE TABLE IF NOT EXISTS public.comment_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    comment_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on rate limits table
ALTER TABLE public.comment_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy for rate limits (only system can access)
CREATE POLICY "System only access for rate limits"
ON public.comment_rate_limits
FOR ALL
USING (false); -- No user access, only service role

-- Table for security audit logs
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    user_id UUID,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy for audit logs (only admins can view)
CREATE POLICY "Only admins can view audit logs"
ON public.security_audit_logs
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.authorized_users au 
        WHERE au.user_id = auth.uid() 
        AND au.created_by IS NULL
    )
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_comment_rate_limits_user_window 
ON public.comment_rate_limits(user_id, window_start);

CREATE INDEX IF NOT EXISTS idx_security_audit_logs_event_type 
ON public.security_audit_logs(event_type);

CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id 
ON public.security_audit_logs(user_id);

-- Function to validate coordinate inputs for property functions
CREATE OR REPLACE FUNCTION public.validate_coordinates(lat NUMERIC, lng NUMERIC)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Enhanced function with input validation for property comparables
CREATE OR REPLACE FUNCTION public.find_secure_comparables(
    center_lat NUMERIC, 
    center_lng NUMERIC, 
    prop_type TEXT, 
    target_area NUMERIC DEFAULT 100,
    max_distance_km NUMERIC DEFAULT 25
)
RETURNS TABLE(
    id UUID,
    general_location TEXT,
    price_range TEXT,
    total_area NUMERIC,
    approximate_latitude NUMERIC,
    approximate_longitude NUMERIC,
    property_type TEXT,
    distance_km NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Input validation
    IF NOT public.validate_coordinates(center_lat, center_lng) THEN
        RAISE EXCEPTION 'Invalid coordinates provided';
    END IF;
    
    IF prop_type IS NULL OR LENGTH(prop_type) = 0 THEN
        RAISE EXCEPTION 'Property type is required';
    END IF;
    
    IF target_area IS NULL OR target_area <= 0 OR target_area > 10000 THEN
        RAISE EXCEPTION 'Target area must be between 1 and 10000 square meters';
    END IF;
    
    IF max_distance_km IS NULL OR max_distance_km <= 0 OR max_distance_km > 100 THEN
        RAISE EXCEPTION 'Distance must be between 1 and 100 kilometers';
    END IF;
    
    -- Log the access attempt
    INSERT INTO public.security_audit_logs (event_type, details)
    VALUES ('comparable_search', jsonb_build_object(
        'coordinates', jsonb_build_object('lat', center_lat, 'lng', center_lng),
        'property_type', prop_type,
        'target_area', target_area,
        'max_distance', max_distance_km
    ));
    
    -- Return secure results with limited data
    RETURN QUERY
    SELECT 
        pc.id,
        CONCAT(pc.city, ', ', pc.country) as general_location,
        CASE 
            WHEN pc.price_usd < 50000 THEN 'Menos de $50,000'
            WHEN pc.price_usd < 100000 THEN '$50,000 - $100,000'
            WHEN pc.price_usd < 200000 THEN '$100,000 - $200,000'
            WHEN pc.price_usd < 300000 THEN '$200,000 - $300,000'
            WHEN pc.price_usd < 500000 THEN '$300,000 - $500,000'
            ELSE 'Más de $500,000'
        END as price_range,
        pc.total_area,
        ROUND(CAST(pc.latitude AS NUMERIC), 1) as approximate_latitude,
        ROUND(CAST(pc.longitude AS NUMERIC), 1) as approximate_longitude,
        pc.property_type,
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
        ) AS distance_km
    FROM public.property_comparables pc
    WHERE pc.property_type = prop_type
        AND pc.latitude IS NOT NULL 
        AND pc.longitude IS NOT NULL
        AND pc.latitude BETWEEN -90 AND 90
        AND pc.longitude BETWEEN -180 AND 180
        AND pc.total_area BETWEEN (target_area * 0.5) AND (target_area * 2.0)
        AND 6371 * acos(
            cos(radians(center_lat)) * 
            cos(radians(pc.latitude)) * 
            cos(radians(pc.longitude) - radians(center_lng)) + 
            sin(radians(center_lat)) * 
            sin(radians(pc.latitude))
        ) <= max_distance_km
    ORDER BY distance_km ASC
    LIMIT 5;
END;
$$;