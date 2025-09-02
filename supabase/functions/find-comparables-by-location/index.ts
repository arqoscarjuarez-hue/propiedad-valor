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

    // TÁCTICA AVANZADA: Búsqueda HIPERLOCAL (0-5km, fallback 8km)
    let comparables: any[] = [];
    let searchStrategy = 'none';

    // Estrategia 1: Búsqueda avanzada con similaridad (máx. 5km, luego 8km)
    try {
      console.log('🎯 Strategy 1A: Advanced similarity within 5km');
      const { data: adv5, error: adv5Err } = await supabase
        .rpc('find_best_comparables', {
          center_lat: target_lat,
          center_lng: target_lng,
          prop_type: target_property_type,
          target_area: target_area || 0,
          max_distance_km: 5,
        });

      if (!adv5Err && adv5 && adv5.length > 0) {
        comparables = adv5;
        searchStrategy = 'advanced_similarity_5km';
        console.log(`✅ Strategy 1A SUCCESS: ${comparables.length} comparables found`);
      } else {
        console.log('⚠️ Strategy 1A no results, trying 8km', adv5Err);
        try {
          console.log('🎯 Strategy 1B: Advanced similarity within 8km');
          const { data: adv8, error: adv8Err } = await supabase
            .rpc('find_best_comparables', {
              center_lat: target_lat,
              center_lng: target_lng,
              prop_type: target_property_type,
              target_area: target_area || 0,
              max_distance_km: 8,
            });

          if (!adv8Err && adv8 && adv8.length > 0) {
            comparables = adv8;
            searchStrategy = 'advanced_similarity_8km';
            console.log(`✅ Strategy 1B SUCCESS: ${comparables.length} comparables found`);
          }
        } catch (error) {
          console.log('❌ Strategy 1B ERROR:', error);
        }
      }
    } catch (error) {
      console.log('❌ Strategy 1A ERROR:', error);
    }

    // Estrategia 2: Fallback - búsqueda simple por radio (1km, 3km, 5km, 8km)
    if (comparables.length === 0) {
      console.log('🎯 Strategy 2: Simple radius search (1,3,5,8km)');
      const radii = [1, 3, 5, 8];

      for (const radius of radii) {
        try {
          const { data, error } = await supabase
            .rpc('find_comparables_within_radius', {
              center_lat: target_lat,
              center_lng: target_lng,
              prop_type: target_property_type,
              radius_km: radius,
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

    // Nota: Eliminamos la estrategia de "type-only" para evitar resultados fuera del radio máximo (8km)


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