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

    console.log('Searching for comparables with:', {
      target_lat,
      target_lng,
      target_property_type,
      target_area
    });

    // Use the advanced function to find the best comparables
    const { data, error } = await supabase
      .rpc('find_best_comparables', {
        center_lat: target_lat,
        center_lng: target_lng,
        prop_type: target_property_type,
        target_area: target_area || 0,
        max_distance_km: 50
      });

    if (error) {
      console.error('Error finding comparables:', error);
      return new Response(
        JSON.stringify({ data: [], error: error.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    const comparables = data || [];
    console.log(`Found ${comparables.length} comparables with similarity scores`);
    
    // Log the quality of matches found
    if (comparables.length > 0) {
      const avgSimilarity = comparables.reduce((sum: number, comp: any) => 
        sum + (comp.overall_similarity_score || 0), 0) / comparables.length;
      console.log(`Average similarity score: ${avgSimilarity.toFixed(3)}`);
      
      comparables.forEach((comp: any, index: number) => {
        console.log(`Comparable ${index + 1}: ${comp.total_area}m², ${comp.distance}km, similarity: ${comp.overall_similarity_score}`);
      });
    }

    return new Response(
      JSON.stringify({ data: comparables }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in find-comparables-by-location:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});