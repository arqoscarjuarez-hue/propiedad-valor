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
      console.log('🔄 FALLBACK: Trying area-prioritized within local radius');
      try {
        const { data: areaFirst, error: areaErr } = await supabase
          .rpc('find_area_prioritized_comparables', {
            center_lat: target_lat,
            center_lng: target_lng,
            prop_type: target_property_type,
            target_area: target_area || 0,
            max_distance_km: 15
          });

        if (!areaErr && areaFirst && areaFirst.length > 0) {
          comparables = areaFirst.map((c: any) => ({
            ...c,
            similarity_score: Math.round(((c.overall_similarity_score || 0) * 100 + (c.area_similarity_score || 0) * 100) / 2),
            selection_reason: c.selection_reason || 'Area-prioritized comparable (≤15km)'
          }));
          searchStrategy = 'area_prioritized_local';
          console.log(`✅ Area-prioritized SUCCESS: ${comparables.length} within local radius`);
        }
      } catch (error) {
        console.log('❌ Area-prioritized ERROR:', error);
      }
    }

    if (comparables.length === 0) {
      console.log('🔄 FALLBACK 2: Trying exact/similar types with dynamic radius (≤25km)');
      try {
        const { data: exactType, error: exactErr } = await supabase
          .rpc('find_exact_type_comparables', {
            center_lat: target_lat,
            center_lng: target_lng,
            prop_type: target_property_type,
            target_area: target_area || 0
          });

        if (!exactErr && exactType && exactType.length > 0) {
          comparables = exactType.map((c: any) => ({
            ...c,
            similarity_score: Math.round((c.overall_similarity_score || 0) * 100),
            selection_reason: c.selection_reason || 'Exact/similar type within ≤25km'
          }));
          searchStrategy = 'exact_type_priority';
          console.log(`✅ Exact/Similar type SUCCESS: ${comparables.length} results`);
        }
      } catch (error) {
        console.log('❌ Exact type fallback ERROR:', error);
      }
    }

    if (comparables.length === 0) {
      console.log('🔄 FALLBACK 3: Trying flexible comparables (≤25km)');
      try {
        const { data: flexible, error: flexErr } = await supabase
          .rpc('find_flexible_comparables', {
            center_lat: target_lat,
            center_lng: target_lng,
            prop_type: target_property_type,
            target_area: target_area || 0,
            max_distance_km: 25
          });

        if (!flexErr && flexible && flexible.length > 0) {
          comparables = flexible.map((c: any) => ({
            ...c,
            similarity_score: Math.round((c.overall_similarity_score || 0) * 100),
            selection_reason: c.selection_reason || 'Flexible comparable within ≤25km'
          }));
          searchStrategy = 'flexible_local_radius';
          console.log(`✅ Flexible SUCCESS: ${comparables.length} results within ≤25km`);
        }
      } catch (error) {
        console.log('❌ Flexible fallback ERROR:', error);
      }
    }

    if (comparables.length === 0) {
      console.log('🔄 FALLBACK 4: Exact type within radius using basic query (≤25km)');
      try {
        const { data: withinRadius, error: radiusErr } = await supabase
          .rpc('find_comparables_within_radius', {
            center_lat: target_lat,
            center_lng: target_lng,
            prop_type: target_property_type,
            radius_km: 25
          });

        if (!radiusErr && withinRadius && withinRadius.length > 0) {
          comparables = withinRadius.map((item: any) => ({
            ...item,
            adjusted_price_usd: item.price_usd, // no market adjust here
            adjusted_price_per_sqm: item.price_per_sqm_usd,
            similarity_score: 60.0,
            selection_reason: 'Within 25km radius (basic)',
            distance: item.distance
          }));
          searchStrategy = 'within_radius_basic';
          console.log(`✅ Radius SUCCESS: ${comparables.length} results within 25km`);
        }
      } catch (error) {
        console.log('❌ Radius fallback ERROR:', error);
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