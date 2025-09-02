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

    console.log('🔬 PROFESSIONAL SEARCH - Parameters:', {
      target_lat,
      target_lng,
      target_property_type,
      target_area,
      timestamp: new Date().toISOString()
    });

    // AJUSTE DE MERCADO: Precios realistas según ubicación geográfica
    let comparables: any[] = [];
    let searchStrategy = 'none';

    console.log('🎯 MARKET-ADJUSTED SEARCH: Starting location-aware pricing');

    // Estimar precio objetivo basado en área y mercado local
    const estimatedPricePerSqm = target_lat >= 13.0 && target_lat <= 14.5 && target_lng >= -90.5 && target_lng <= -87.5 
      ? 600  // El Salvador: ~$600/m²
      : target_lat >= 13.7 && target_lat <= 17.8 && target_lng >= -92.3 && target_lng <= -88.2
      ? 750  // Guatemala: ~$750/m²
      : target_lat >= 12.9 && target_lat <= 16.0 && target_lng >= -89.4 && target_lng <= -83.1
      ? 500  // Honduras: ~$500/m²
      : 1500; // Mexico/Other: ~$1500/m²

    const estimatedTotalPrice = (target_area || 100) * estimatedPricePerSqm;

    console.log(`📍 Market estimation: ${estimatedPricePerSqm}/m² → Total: $${estimatedTotalPrice.toLocaleString()}`);

    // Estrategia 1: TIPO EXACTO prioritario + ajuste de mercado
    try {
      const { data: exactTypeData, error: exactTypeError } = await supabase
        .rpc('find_exact_type_comparables', {
          center_lat: target_lat,
          center_lng: target_lng,
          prop_type: target_property_type,
          target_area: target_area || 0,
          target_price_range: estimatedTotalPrice
        });

      if (!exactTypeError && exactTypeData && exactTypeData.length > 0) {
        comparables = exactTypeData;
        searchStrategy = 'exact_type_prioritized';
        
        const exactMatches = exactTypeData.filter(c => c.type_match_score === 1.0).length;
        const similarMatches = exactTypeData.filter(c => c.type_match_score === 0.8).length;
        
        console.log(`✅ Exact Type Priority SUCCESS: ${comparables.length} comparables found`);
        console.log(`🎯 Exact type matches: ${exactMatches} | Similar types: ${similarMatches}`);
        console.log(`💰 Adjusted price range: $${Math.min(...comparables.map(c => c.adjusted_price_usd)).toLocaleString()} - $${Math.max(...comparables.map(c => c.adjusted_price_usd)).toLocaleString()}`);
      } else {
        console.log('⚠️ Exact Type Priority failed:', exactTypeError);
      }
    } catch (error) {
      console.log('❌ Exact Type Priority ERROR:', error);
    }

    // Estrategia 2: Fallback ampliado si no hay suficientes resultados
    if (comparables.length < 3) {
      console.log('🎯 Fallback: Expanding search criteria for minimum comparables');
      
      try {
        // Buscar con criterios más amplios: todos los tipos de propiedades similares
        const { data: broadData, error: broadError } = await supabase
          .from('property_comparables')
          .select('*')
          .or(`property_type.eq.${target_property_type},property_type.eq.casa,property_type.eq.vivienda,property_type.eq.residencial`)
          .not('price_usd', 'is', null)
          .not('price_per_sqm_usd', 'is', null)
          .not('total_area', 'is', null)
          .gt('price_usd', 0)
          .gt('price_per_sqm_usd', 0)
          .gt('total_area', 0)
          .gte('sale_date', new Date(Date.now() - 36 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Last 36 months
          .order('sale_date', { ascending: false })
          .limit(10);

        if (!broadError && broadData && broadData.length > 0) {
          // Calcular distancias y scores para los resultados amplios
          comparables = broadData.map(item => {
            const distance = item.latitude && item.longitude ? 
              Math.round(
                6371 * Math.acos(
                  Math.cos(target_lat * Math.PI / 180) * 
                  Math.cos(item.latitude * Math.PI / 180) * 
                  Math.cos((item.longitude - target_lng) * Math.PI / 180) + 
                  Math.sin(target_lat * Math.PI / 180) * 
                  Math.sin(item.latitude * Math.PI / 180)
                ) * 100
              ) / 100 : null;

            const area_similarity = target_area ? 
              Math.max(0, 1 - Math.abs(item.total_area - target_area) / Math.max(item.total_area, target_area)) 
              : 0.5;

            return {
              ...item,
              distance,
              area_similarity_score: area_similarity,
              overall_similarity_score: area_similarity * 0.7 + (distance ? Math.max(0, 1 - distance / 20) * 0.3 : 0.3),
              months_old: Math.floor((Date.now() - new Date(item.sale_date).getTime()) / (30 * 24 * 60 * 60 * 1000))
            };
          }).sort((a, b) => b.overall_similarity_score - a.overall_similarity_score);

          searchStrategy = 'broad_fallback';
          console.log(`✅ Broad Fallback SUCCESS: ${comparables.length} comparables found`);
        }
      } catch (error) {
        console.log('❌ Broad Fallback ERROR:', error);
      }
    }

    // Estrategia 3: Último recurso - cualquier propiedad con datos válidos
    if (comparables.length === 0) {
      console.log('🎯 Last Resort: Any valid property data');
      
      try {
        const { data: lastData, error: lastError } = await supabase
          .from('property_comparables')
          .select('*')
          .not('price_usd', 'is', null)
          .not('price_per_sqm_usd', 'is', null)
          .not('total_area', 'is', null)
          .gt('price_usd', 0)
          .gt('price_per_sqm_usd', 0)
          .gt('total_area', 0)
          .order('sale_date', { ascending: false })
          .limit(5);

        if (!lastError && lastData && lastData.length > 0) {
          comparables = lastData.map(item => ({
            ...item,
            distance: null,
            area_similarity_score: 0.3,
            overall_similarity_score: 0.3,
            months_old: item.sale_date ? Math.floor((Date.now() - new Date(item.sale_date).getTime()) / (30 * 24 * 60 * 60 * 1000)) : null
          }));
          searchStrategy = 'last_resort';
          console.log(`✅ Last Resort SUCCESS: ${comparables.length} comparables found`);
        }
      } catch (error) {
        console.log('❌ Last Resort ERROR:', error);
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
        },
        professional_methodology: {
          time_range: '36 months (flexible)',
          distance_range: '0-15km (expandable)',
          property_types: 'flexible matching',
          minimum_data_quality: 'price, area, coordinates required'
        }
      }
    };

    console.log('🎉 PROFESSIONAL SEARCH RESULT:', {
      strategy: searchStrategy,
      count: comparables.length,
      has_scores: comparables.some(c => c.overall_similarity_score !== undefined),
      sample_comparable: comparables[0] ? {
        address: comparables[0].address,
        price: comparables[0].price_usd,
        distance: comparables[0].distance,
        similarity: comparables[0].overall_similarity_score
      } : null
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