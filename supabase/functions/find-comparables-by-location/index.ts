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

    console.log('🔬 PROFESSIONAL COMPARABLES SEARCH - Parameters:', {
      target_lat,
      target_lng,
      target_property_type,
      target_area,
      timestamp: new Date().toISOString()
    });

    // METODOLOGÍA PROFESIONAL: Búsqueda flexible basada en estándares internacionales
    let comparables: any[] = [];
    let searchStrategy = 'none';

    // Estrategia 1: Búsqueda flexible profesional (2km, 5km, 8km, 15km)
    const searchRadii = [2, 5, 8, 15];
    
    for (const radius of searchRadii) {
      if (comparables.length >= 3) break; // Ya tenemos suficientes
      
      try {
        console.log(`🎯 Professional search within ${radius}km radius`);
        const { data: flexData, error: flexError } = await supabase
          .rpc('find_flexible_comparables', {
            center_lat: target_lat,
            center_lng: target_lng,
            prop_type: target_property_type,
            target_area: target_area || 0,
            max_distance_km: radius,
          });

        if (!flexError && flexData && flexData.length > 0) {
          comparables = flexData;
          searchStrategy = `flexible_${radius}km`;
          console.log(`✅ Professional search SUCCESS at ${radius}km: ${comparables.length} comparables found`);
          
          if (comparables.length >= 3) {
            break; // Suficientes comparables encontrados
          }
        } else {
          console.log(`⚠️ Professional search at ${radius}km: no results`, flexError);
        }
      } catch (error) {
        console.log(`❌ Professional search ERROR at ${radius}km:`, error);
      }
    }

    // Estrategia 2: Fallback usando función original si la flexible no encuentra nada
    if (comparables.length === 0) {
      console.log('🎯 Fallback: Using original functions with extended range');
      
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .rpc('find_best_comparables', {
            center_lat: target_lat,
            center_lng: target_lng,
            prop_type: target_property_type,
            target_area: target_area || 0,
            max_distance_km: 50, // Much wider range as last resort
          });

        if (!fallbackError && fallbackData && fallbackData.length > 0) {
          comparables = fallbackData;
          searchStrategy = 'fallback_50km';
          console.log(`✅ Fallback SUCCESS: ${comparables.length} comparables found`);
        }
      } catch (error) {
        console.log('❌ Fallback ERROR:', error);
      }
    }

    // Si aún no hay resultados, informar el problema
    if (comparables.length === 0) {
      console.log('⚠️ NO COMPARABLES FOUND with any strategy');
      searchStrategy = 'no_results';
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