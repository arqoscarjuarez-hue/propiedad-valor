import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { target_lat, target_lng, target_property_type, target_area } = await req.json();

    console.log('🔬 ADVANCED SEARCH - Parameters:', {
      target_lat,
      target_lng,
      target_property_type,
      target_area,
      timestamp: new Date().toISOString()
    });

    // TÁCTICA AVANZADA: Multi-estrategia de búsqueda
    let comparables: any[] = [];
    let searchStrategy = 'none';

    // Estrategia 1: Búsqueda avanzada con similaridad
    try {
      console.log('🎯 Strategy 1: Advanced similarity search');
      const { data: advancedData, error: advancedError } = await supabase
        .rpc('find_best_comparables', {
          center_lat: target_lat,
          center_lng: target_lng,
          prop_type: target_property_type,
          target_area: target_area || 0,
          max_distance_km: 50
        });

      if (!advancedError && advancedData && advancedData.length > 0) {
        comparables = advancedData;
        searchStrategy = 'advanced_similarity';
        console.log(`✅ Strategy 1 SUCCESS: ${comparables.length} comparables found`);
      } else {
        console.log('⚠️ Strategy 1 FAILED:', advancedError);
      }
    } catch (error) {
      console.log('❌ Strategy 1 ERROR:', error);
    }

    // Estrategia 2: Fallback - búsqueda simple por radio
    if (comparables.length === 0) {
      console.log('🎯 Strategy 2: Simple radius search');
      const radii = [1, 2, 5, 10, 20, 50];
      
      for (const radius of radii) {
        try {
          const { data, error } = await supabase
            .rpc('find_comparables_within_radius', {
              center_lat: target_lat,
              center_lng: target_lng,
              prop_type: target_property_type,
              radius_km: radius
            });

          if (!error && data && data.length > 0) {
            comparables = data;
            searchStrategy = `radius_${radius}km`;
            console.log(`✅ Strategy 2 SUCCESS at ${radius}km: ${comparables.length} comparables`);
            break;
          }
        } catch (error) {
          console.log(`❌ Strategy 2 ERROR at ${radius}km:`, error);
        }
      }
    }

    // Estrategia 3: Último recurso - búsqueda básica por tipo
    if (comparables.length === 0) {
      console.log('🎯 Strategy 3: Basic type-only search');
      try {
        const { data, error } = await supabase
          .from('property_comparables')
          .select('*')
          .eq('property_type', target_property_type)
          .not('price_usd', 'is', null)
          .not('price_per_sqm_usd', 'is', null)
          .not('total_area', 'is', null)
          .gt('price_usd', 0)
          .gt('price_per_sqm_usd', 0)
          .gt('total_area', 0)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!error && data && data.length > 0) {
          // Agregar campos faltantes para compatibilidad
          comparables = data.map(item => ({
            ...item,
            distance: null,
            overall_similarity_score: 0.5,
            area_similarity_score: target_area ? 
              Math.max(0, 1 - Math.abs(item.total_area - target_area) / Math.max(item.total_area, target_area)) 
              : 0.5
          }));
          searchStrategy = 'basic_type';
          console.log(`✅ Strategy 3 SUCCESS: ${comparables.length} comparables`);
        }
      } catch (error) {
        console.log('❌ Strategy 3 ERROR:', error);
      }
    }

    // Resultado final con información detallada
    const result = {
      data: comparables,
      metadata: {
        strategy_used: searchStrategy,
        total_found: comparables.length,
        search_timestamp: new Date().toISOString(),
        search_parameters: {
          target_lat,
          target_lng,
          target_property_type,
          target_area
        }
      }
    };

    console.log('🎉 FINAL RESULT:', {
      strategy: searchStrategy,
      count: comparables.length,
      has_similarity_scores: comparables.some(c => c.overall_similarity_score !== undefined)
    });

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('💥 CRITICAL ERROR in find-comparables-by-location:', error);
    return new Response(
      JSON.stringify({ 
        data: [], 
        error: error.message,
        metadata: {
          strategy_used: 'error',
          total_found: 0,
          search_timestamp: new Date().toISOString()
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})