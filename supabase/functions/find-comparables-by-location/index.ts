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

    // NORMA ACTUALIZADA: Búsqueda con filtro de 18 meses + expansión por cantidad
    let comparables: any[] = [];
    let searchStrategy = 'none';

    // Estrategia 1: Búsqueda avanzada 0-5km (18 meses)
    try {
      console.log('🎯 Strategy 1A: Advanced similarity within 5km (18 months)');
      const { data: adv5, error: adv5Err } = await supabase
        .rpc('find_best_comparables', {
          center_lat: target_lat,
          center_lng: target_lng,
          prop_type: target_property_type,
          target_area: target_area || 0,
          max_distance_km: 5,
        });

      if (!adv5Err && adv5 && adv5.length >= 3) {
        comparables = adv5;
        searchStrategy = 'advanced_similarity_5km_18m';
        console.log(`✅ Strategy 1A SUCCESS: ${comparables.length} comparables found`);
      } else {
        console.log(`⚠️ Strategy 1A insufficient results: ${adv5?.length || 0} (need 3+)`);
        
        // Estrategia 1B: Expandir a 8km
        try {
          console.log('🎯 Strategy 1B: Advanced similarity within 8km (18 months)');
          const { data: adv8, error: adv8Err } = await supabase
            .rpc('find_best_comparables', {
              center_lat: target_lat,
              center_lng: target_lng,
              prop_type: target_property_type,
              target_area: target_area || 0,
              max_distance_km: 8,
            });

          if (!adv8Err && adv8 && adv8.length >= 3) {
            comparables = adv8;
            searchStrategy = 'advanced_similarity_8km_18m';
            console.log(`✅ Strategy 1B SUCCESS: ${comparables.length} comparables found`);
          } else {
            console.log(`⚠️ Strategy 1B insufficient: ${adv8?.length || 0}, trying 10km...`);
            
            // Estrategia 1C: Expandir a 10km (última oportunidad)
            try {
              console.log('🎯 Strategy 1C: Advanced similarity within 10km (18 months)');
              const { data: adv10, error: adv10Err } = await supabase
                .rpc('find_best_comparables', {
                  center_lat: target_lat,
                  center_lng: target_lng,
                  prop_type: target_property_type,
                  target_area: target_area || 0,
                  max_distance_km: 10,
                });

              if (!adv10Err && adv10 && adv10.length >= 3) {
                comparables = adv10;
                searchStrategy = 'advanced_similarity_10km_18m';
                console.log(`✅ Strategy 1C SUCCESS: ${comparables.length} comparables found`);
              } else {
                console.log(`⚠️ Strategy 1C still insufficient: ${adv10?.length || 0}`);
                // Guardar lo que tenemos aunque sean menos de 3
                comparables = adv10 || adv8 || adv5 || [];
                searchStrategy = comparables.length > 0 ? 'partial_results_10km_18m' : 'no_results';
              }
            } catch (error) {
              console.log('❌ Strategy 1C ERROR:', error);
            }
          }
        } catch (error) {
          console.log('❌ Strategy 1B ERROR:', error);
        }
      }
    } catch (error) {
      console.log('❌ Strategy 1A ERROR:', error);
    }

    // Estrategia 2: Fallback con radio progresivo (solo si no tenemos al menos 3)
    if (comparables.length < 3) {
      console.log('🎯 Strategy 2: Progressive radius search (1,3,5,8,10km, 18 months)');
      const radii = [1, 3, 5, 8, 10];

      for (const radius of radii) {
        try {
          const { data, error } = await supabase
            .rpc('find_comparables_within_radius', {
              center_lat: target_lat,
              center_lng: target_lng,
              prop_type: target_property_type,
              radius_km: radius,
            });

          if (!error && data && data.length >= 3) {
            comparables = data;
            searchStrategy = `radius_${radius}km_18m`;
            console.log(`✅ Strategy 2 SUCCESS at ${radius}km: ${comparables.length} comparables`);
            break;
          } else {
            console.log(`⚠️ Strategy 2 at ${radius}km: ${data?.length || 0} results (need 3+)`);
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