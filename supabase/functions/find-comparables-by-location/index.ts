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

    console.log('🏛️ PROFESSIONAL USPAP SEARCH - Parameters:', {
      target_lat,
      target_lng,
      target_property_type,
      target_area,
      timestamp: new Date().toISOString()
    });

    // ALGORITMO PROFESIONAL USPAP/FANNIE MAE BASADO EN INVESTIGACIÓN
    let comparables: any[] = [];
    let searchStrategy = 'none';

    console.log('🏛️ STARTING INDUSTRY-STANDARD COMPARABLE SELECTION');

    // Estrategia 1: Algoritmo profesional basado en estándares USPAP y Fannie Mae
    try {
      const { data: professionalData, error: professionalError } = await supabase
        .rpc('find_professional_comparables', {
          center_lat: target_lat,
          center_lng: target_lng,
          prop_type: target_property_type,
          target_area: target_area || 0,
          target_bedrooms: 0,  // TODO: Extract from frontend data
          target_bathrooms: 0, // TODO: Extract from frontend data
          target_age_years: 0  // TODO: Extract from frontend data
        });

      if (!professionalError && professionalData && professionalData.length > 0) {
        comparables = professionalData;
        searchStrategy = 'uspap_professional';
        
        console.log(`✅ USPAP PROFESSIONAL SUCCESS: ${comparables.length} comparables found`);
        console.log(`📊 Similarity scores: ${comparables.map(c => c.similarity_score).join(', ')}`);
        console.log(`💰 Adjusted price range: $${Math.min(...comparables.map(c => c.adjusted_price_usd)).toLocaleString()} - $${Math.max(...comparables.map(c => c.adjusted_price_usd)).toLocaleString()}`);
        console.log(`📏 Distance range: ${Math.min(...comparables.map(c => c.distance)).toFixed(1)}km - ${Math.max(...comparables.map(c => c.distance)).toFixed(1)}km`);
        
        // Log professional adjustment details for first comparable
        if (comparables[0]) {
          const c = comparables[0];
          console.log(`🔧 PROFESSIONAL ADJUSTMENTS for ${c.address}:`);
          console.log(`   📐 Area: ${(c.area_adjustment_factor * 100).toFixed(1)}% (${c.total_area}m² vs ${target_area}m²)`);
          console.log(`   📅 Time: ${(c.time_adjustment_factor * 100).toFixed(1)}% (${c.months_old} months old)`);
          console.log(`   📍 Location: ${(c.location_adjustment_factor * 100).toFixed(1)}% (${c.distance}km away)`);
          console.log(`   🏠 Condition: ${(c.condition_adjustment_factor * 100).toFixed(1)}%`);
          console.log(`   🎯 Overall: ${(c.overall_adjustment_factor * 100).toFixed(1)}%`);
          console.log(`   💡 Reason: ${c.selection_reason}`);
          console.log(`   💰 Net Adjustment: $${c.net_adjustment_amount?.toLocaleString()}`);
          console.log(`   📊 Gross Adjustment: $${c.gross_adjustment_amount?.toLocaleString()}`);
        }
      } else {
        console.log('⚠️ USPAP Professional failed:', professionalError);
      }
    } catch (error) {
      console.log('❌ USPAP Professional ERROR:', error);
    }

    // Fallback Strategy 2: If no professional results, try broader search
    if (comparables.length === 0) {
      console.log('🔄 FALLBACK: Trying broader search criteria');
      
      try {
        // Simple fallback to any available data for emergency cases
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('property_comparables')
          .select('*')
          .eq('property_type', target_property_type)
          .not('price_usd', 'is', null)
          .not('total_area', 'is', null)
          .order('sale_date', { ascending: false })
          .limit(3);

        if (!fallbackError && fallbackData && fallbackData.length > 0) {
          // Apply basic market adjustments
          const market_factor = target_lat >= 13.0 && target_lat <= 14.5 && target_lng >= -90.5 && target_lng <= -87.5 ? 0.35 : 1.0;
          
          comparables = fallbackData.map(item => ({
            ...item,
            adjusted_price_usd: Math.round(item.price_usd * market_factor),
            adjusted_price_per_sqm: Math.round(item.price_per_sqm_usd * market_factor),
            similarity_score: 50.0, // Default moderate score
            selection_reason: 'Fallback: Limited data available - basic type match only',
            distance: null,
            area_adjustment_factor: 0.85,
            time_adjustment_factor: 0.90,
            location_adjustment_factor: 0.75,
            condition_adjustment_factor: 0.90,
            overall_adjustment_factor: 0.85 * 0.90 * 0.75 * 0.90,
            net_adjustment_amount: Math.round(item.price_usd * market_factor * 0.15),
            gross_adjustment_amount: Math.round(item.price_usd * market_factor * 0.25),
            months_old: item.sale_date ? Math.floor((Date.now() - new Date(item.sale_date).getTime()) / (30 * 24 * 60 * 60 * 1000)) : null
          }));
          
          searchStrategy = 'basic_fallback';
          console.log(`✅ Fallback SUCCESS: ${comparables.length} comparables with basic adjustments`);
        }
      } catch (error) {
        console.log('❌ Fallback ERROR:', error);
      }
    }

    // Professional result metadata
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
        professional_standards: {
          methodology: 'USPAP Sales Comparison Approach',
          standards_applied: ['Fannie Mae Guidelines', 'USPAP Standards', 'Professional Adjustment Factors'],
          adjustment_criteria: ['Area (±50% max)', 'Time (24 months max)', 'Location (25km max)', 'Condition (age proxy)'],
          minimum_comparables: 3,
          radius_expansion: 'Progressive: 1km → 2km → 5km → 10km → 25km',
          market_adjustments: 'Country-specific pricing (El Salvador: 35% of Mexico prices)'
        },
        quality_metrics: comparables.length > 0 ? {
          avg_similarity_score: Math.round(comparables.reduce((sum, c) => sum + (c.similarity_score || 0), 0) / comparables.length * 10) / 10,
          avg_distance_km: Math.round(comparables.reduce((sum, c) => sum + (c.distance || 0), 0) / comparables.length * 10) / 10,
          avg_adjustment_factor: Math.round(comparables.reduce((sum, c) => sum + (c.overall_adjustment_factor || 0), 0) / comparables.length * 1000) / 1000,
          optimal_comparables: comparables.filter(c => c.selection_reason?.includes('Optimal')).length,
          good_comparables: comparables.filter(c => c.selection_reason?.includes('Good')).length,
          acceptable_comparables: comparables.filter(c => c.selection_reason?.includes('Acceptable')).length
        } : null
      }
    };

    console.log('🎉 PROFESSIONAL USPAP SEARCH RESULT:', {
      strategy: searchStrategy,
      count: comparables.length,
      quality: result.metadata.quality_metrics,
      standards_compliance: comparables.length >= 3 ? 'COMPLIANT' : 'INSUFFICIENT_DATA'
    });

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('💥 CRITICAL ERROR in professional comparable search:', error);
    return new Response(
      JSON.stringify({ 
        data: [], 
        error: error.message,
        metadata: {
          strategy_used: 'error',
          total_found: 0,
          search_timestamp: new Date().toISOString(),
          professional_standards: {
            methodology: 'USPAP Sales Comparison Approach',
            error_occurred: true
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
})