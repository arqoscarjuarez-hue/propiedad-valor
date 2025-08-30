-- Add social stratum column to property_comparables (skip enum creation as it already exists)
ALTER TABLE public.property_comparables 
ADD COLUMN IF NOT EXISTS estrato_social public.estrato_social DEFAULT 'medio_medio';

-- Add index for better performance when filtering by social stratum (only if not exists)
CREATE INDEX IF NOT EXISTS idx_property_comparables_estrato_social 
ON public.property_comparables(estrato_social);

-- Add some sample data with social strata for testing
UPDATE public.property_comparables 
SET estrato_social = CASE 
  WHEN price_per_sqm_usd > 2500 THEN 'alto_alto'::estrato_social
  WHEN price_per_sqm_usd > 2000 THEN 'alto_medio'::estrato_social
  WHEN price_per_sqm_usd > 1800 THEN 'alto_bajo'::estrato_social
  WHEN price_per_sqm_usd > 1500 THEN 'medio_alto'::estrato_social
  WHEN price_per_sqm_usd > 1200 THEN 'medio_medio'::estrato_social
  WHEN price_per_sqm_usd > 900 THEN 'medio_bajo'::estrato_social
  WHEN price_per_sqm_usd > 600 THEN 'bajo_alto'::estrato_social
  WHEN price_per_sqm_usd > 400 THEN 'bajo_medio'::estrato_social
  ELSE 'bajo_bajo'::estrato_social
END
WHERE estrato_social IS NULL;