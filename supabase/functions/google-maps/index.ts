import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, data } = await req.json()
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY') || ''

    // Allow probing the configuration status without erroring
    if (action === 'get-api-key') {
      return new Response(
        JSON.stringify({ apiKey: GOOGLE_MAPS_API_KEY || null, configured: Boolean(GOOGLE_MAPS_API_KEY) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    switch (action) {
      case 'geocode': {
        const { address } = data
        if (!GOOGLE_MAPS_API_KEY) {
          return new Response(
            JSON.stringify({ results: [], status: 'MISSING_API_KEY', warning: 'Google Maps API key is not configured' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          )
        }
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
        
        try {
          const response = await fetch(geocodeUrl)
          const result = await response.json()
          return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          )
        } catch (e) {
          // Sanitize error message to prevent API key leakage
          const sanitizedMessage = (e as Error).message 
            ? (e as Error).message.replace(/AIza[a-zA-Z0-9_-]{35}/g, '[API_KEY_REDACTED]').replace(/key=[^&\s]+/gi, 'key=[REDACTED]')
            : 'Failed to call Geocoding API';
          return new Response(
            JSON.stringify({ results: [], status: 'ERROR', message: sanitizedMessage }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          )
        }
      }

      case 'reverse-geocode': {
        const { lat, lng } = data
        if (!GOOGLE_MAPS_API_KEY) {
          return new Response(
            JSON.stringify({ results: [], status: 'MISSING_API_KEY', warning: 'Google Maps API key is not configured' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          )
        }
        const reverseGeocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
        
        try {
          const response = await fetch(reverseGeocodeUrl)
          const result = await response.json()
          return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          )
        } catch (e) {
          // Sanitize error message to prevent API key leakage
          const sanitizedMessage = (e as Error).message 
            ? (e as Error).message.replace(/AIza[a-zA-Z0-9_-]{35}/g, '[API_KEY_REDACTED]').replace(/key=[^&\s]+/gi, 'key=[REDACTED]')
            : 'Failed to call Reverse Geocoding API';
          return new Response(
            JSON.stringify({ results: [], status: 'ERROR', message: sanitizedMessage }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          )
        }
      }


      case 'places-search': {
        const { query, lat, lng, radius = 5000 } = data
        if (!GOOGLE_MAPS_API_KEY) {
          return new Response(
            JSON.stringify({ results: [], status: 'MISSING_API_KEY', warning: 'Google Maps API key is not configured' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          )
        }
        const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`
        
        try {
          const response = await fetch(placesUrl)
          const result = await response.json()
          return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          )
        } catch (e) {
          // Sanitize error message to prevent API key leakage
          const sanitizedMessage = (e as Error).message 
            ? (e as Error).message.replace(/AIza[a-zA-Z0-9_-]{35}/g, '[API_KEY_REDACTED]').replace(/key=[^&\s]+/gi, 'key=[REDACTED]')
            : 'Failed to call Places API';
          return new Response(
            JSON.stringify({ results: [], status: 'ERROR', message: sanitizedMessage }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          )
        }
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action', received: action }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }

  } catch (error) {
    console.error('Error in google-maps function:', error)
    
    // Sanitize error message to prevent API key leakage
    const sanitizedMessage = (error as Error).message 
      ? (error as Error).message.replace(/AIza[a-zA-Z0-9_-]{35}/g, '[API_KEY_REDACTED]').replace(/key=[^&\s]+/gi, 'key=[REDACTED]')
      : 'Internal server error';
    
    return new Response(
      JSON.stringify({ 
        error: sanitizedMessage,
        details: 'Check Supabase function logs for more information'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})