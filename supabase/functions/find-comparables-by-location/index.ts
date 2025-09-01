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

    const { target_lat, target_lng, target_property_type } = await req.json();

    console.log('Searching for comparables with:', {
      target_lat,
      target_lng,
      target_property_type
    });

    // Progressive radius search: 1km, 2km, 5km, 10km, 20km, 50km
    // Always try to find exactly 5 comparables
    const radii = [1, 2, 5, 10, 20, 50];
    let comparables: any[] = [];

    for (const radius of radii) {
      console.log(`Searching within ${radius}km radius`);
      
      const { data, error } = await supabase
        .rpc('find_comparables_within_radius', {
          center_lat: target_lat,
          center_lng: target_lng,
          prop_type: target_property_type,
          radius_km: radius
        });

      if (error) {
        console.error(`Error searching within ${radius}km:`, error);
        continue;
      }

      if (data && data.length > 0) {
        comparables = data;
        console.log(`Found ${data.length} comparables within ${radius}km`);
        
        // If we found 5 or more, we're done
        if (data.length >= 5) {
          break;
        }
        
        // If this is the last radius and we still don't have 5, 
        // take what we found
        if (radius === 50) {
          break;
        }
      }
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