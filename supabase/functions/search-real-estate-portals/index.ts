import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Portal mappings by country
const REAL_ESTATE_PORTALS = {
  'El Salvador': [
    'https://www.encuentra24.com/el-salvador-es/bienes-raices-venta',
    'https://www.olx.com.sv/inmuebles',
    'https://www.mercadolibre.com.sv/inmuebles',
    'https://www.propiedades.com.sv',
    'https://www.inmonet.com.sv'
  ],
  'Guatemala': [
    'https://www.encuentra24.com/guatemala-es/bienes-raices-venta',
    'https://www.olx.com.gt/inmuebles',
    'https://www.mercadolibre.com.gt/inmuebles'
  ],
  'Honduras': [
    'https://www.encuentra24.com/honduras-es/bienes-raices-venta',
    'https://www.olx.com.hn/inmuebles'
  ],
  'Mexico': [
    'https://www.inmuebles24.com/mexico',
    'https://www.propiedades.com',
    'https://www.metroscubicos.com',
    'https://www.mercadolibre.com.mx/inmuebles'
  ],
  'default': [
    'https://www.encuentra24.com',
    'https://www.olx.com',
    'https://www.mercadolibre.com'
  ]
};

// Determine country from coordinates
function getCountryFromCoordinates(lat: number, lng: number): string {
  // Central America coordinate ranges
  if (lat >= 13.0 && lat <= 14.5 && lng >= -90.5 && lng <= -87.5) {
    return 'El Salvador';
  } else if (lat >= 13.7 && lat <= 17.8 && lng >= -92.3 && lng <= -88.2) {
    return 'Guatemala';
  } else if (lat >= 12.9 && lat <= 16.0 && lng >= -89.4 && lng <= -83.1) {
    return 'Honduras';
  } else if (lat >= 14.5 && lat <= 32.7 && lng >= -118.4 && lng <= -86.7) {
    return 'Mexico';
  }
  return 'default';
}

// Scrape portal for properties
async function scrapePortal(url: string, searchParams: any): Promise<any[]> {
  try {
    console.log(`🔍 Scraping portal: ${url}`);
    
    // Basic search patterns for property data
    const searchUrl = `${url}?q=${searchParams.propertyType}&location=${searchParams.location}&area=${searchParams.area}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PropertyBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      console.warn(`Portal ${url} returned status: ${response.status}`);
      return [];
    }

    const html = await response.text();
    
    // Simple HTML parsing for property data (would need enhancement for production)
    const properties = extractPropertiesFromHTML(html, url);
    
    console.log(`✅ Found ${properties.length} properties from ${url}`);
    return properties;
    
  } catch (error) {
    console.warn(`❌ Error scraping ${url}:`, error.message);
    return [];
  }
}

// Extract property data from HTML (simplified)
function extractPropertiesFromHTML(html: string, sourceUrl: string): any[] {
  const properties: any[] = [];
  
  try {
    // This is a simplified extraction - in production would use proper HTML parser
    // Looking for common property data patterns
    const priceMatches = html.match(/\$[\d,]+/g) || [];
    const areaMatches = html.match(/(\d+)\s*m[²2]/g) || [];
    
    // Create mock properties based on patterns found
    for (let i = 0; i < Math.min(priceMatches.length, 3); i++) {
      const price = priceMatches[i]?.replace(/[$,]/g, '');
      const area = areaMatches[i]?.match(/\d+/)?.[0];
      
      if (price && area && parseInt(price) > 10000 && parseInt(area) > 20) {
        properties.push({
          source: 'portal_scraping',
          source_url: sourceUrl,
          price_usd: parseInt(price),
          total_area: parseInt(area),
          price_per_sqm_usd: Math.round(parseInt(price) / parseInt(area)),
          property_type: 'casa', // Would be detected from content
          address: `Propiedad encontrada via ${sourceUrl}`,
          sale_date: new Date().toISOString().split('T')[0],
          scraped_at: new Date().toISOString(),
          confidence_score: 0.7 // Medium confidence for scraped data
        });
      }
    }
  } catch (error) {
    console.warn('Error extracting properties:', error);
  }
  
  return properties;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { target_lat, target_lng, target_property_type, target_area } = await req.json();

    console.log('🌐 PORTAL SEARCH - Parameters:', {
      target_lat,
      target_lng,
      target_property_type,
      target_area,
      timestamp: new Date().toISOString()
    });

    // Determine country and get relevant portals
    const country = getCountryFromCoordinates(target_lat, target_lng);
    const portals = REAL_ESTATE_PORTALS[country] || REAL_ESTATE_PORTALS.default;
    
    console.log(`🏠 Detected country: ${country}, searching ${portals.length} portals`);

    const searchParams = {
      propertyType: target_property_type,
      location: `${target_lat},${target_lng}`,
      area: target_area,
      country: country
    };

    // Search all portals in parallel
    const portalPromises = portals.map(portal => scrapePortal(portal, searchParams));
    const portalResults = await Promise.allSettled(portalPromises);

    // Collect all successful results
    let allPortalProperties: any[] = [];
    portalResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allPortalProperties = [...allPortalProperties, ...result.value];
      } else {
        console.warn(`Portal ${portals[index]} failed:`, result.reason);
      }
    });

    // Get database comparables with area priority
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: dbComparables, error } = await supabase
      .rpc('find_area_prioritized_comparables', {
        center_lat: target_lat,
        center_lng: target_lng,
        prop_type: target_property_type,
        target_area: target_area || 0,
        max_distance_km: 15
      });

    if (error) {
      console.warn('Database comparables error:', error);
    }

    // Combine and prioritize results
    const combinedResults = [
      ...(dbComparables || []).map(item => ({ ...item, source: 'database', confidence_score: 1.0 })),
      ...allPortalProperties
    ].sort((a, b) => {
      // Priority: Area similarity first, then confidence, then recency
      const aAreaDiff = Math.abs((a.total_area || 0) - target_area);
      const bAreaDiff = Math.abs((b.total_area || 0) - target_area);
      
      if (aAreaDiff !== bAreaDiff) {
        return aAreaDiff - bAreaDiff; // Closer area first
      }
      
      return (b.confidence_score || 0) - (a.confidence_score || 0); // Higher confidence first
    }).slice(0, 3); // Top 3 only

    const result = {
      data: combinedResults,
      metadata: {
        strategy_used: 'area_prioritized_with_portals',
        total_found: combinedResults.length,
        country_detected: country,
        portals_searched: portals.length,
        portal_properties_found: allPortalProperties.length,
        database_properties_found: (dbComparables || []).length,
        search_timestamp: new Date().toISOString(),
        search_parameters: {
          target_lat,
          target_lng,
          target_property_type,
          target_area
        }
      }
    };

    console.log('🎉 COMBINED SEARCH RESULT:', {
      country,
      total_properties: combinedResults.length,
      portal_properties: allPortalProperties.length,
      database_properties: (dbComparables || []).length,
      top_3_sources: combinedResults.map(p => p.source)
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('💥 CRITICAL ERROR in search-real-estate-portals:', error);
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