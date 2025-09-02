import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

// CORS for browser calls
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Haversine distance in km
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Bounding box for a radius (km)
function bbox(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / 111; // ~111 km per degree latitude
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

// Normalize property type + synonyms group
function normalizeType(raw?: string) {
  const t = (raw || "").toLowerCase().trim();
  if (["casa", "vivienda", "residencial"].includes(t)) return { canonical: "casa", group: ["casa", "vivienda", "residencial"] };
  if (["apartamento", "departamento", "condominio", "piso"].includes(t)) return { canonical: "apartamento", group: ["apartamento", "departamento", "condominio", "piso"] };
  if (["terreno", "lote", "solar"].includes(t)) return { canonical: "terreno", group: ["terreno", "lote", "solar"] };
  if (["local_comercial", "local", "comercial", "oficina"].includes(t)) return { canonical: "local_comercial", group: ["local_comercial", "local", "comercial", "oficina"] };
  return { canonical: t || "casa", group: [t || "casa"] };
}

// Very simple country detection by bounding boxes used elsewhere in project
function countryFromLatLng(lat: number, lng: number): string {
  if (lat >= 13.0 && lat <= 14.5 && lng >= -90.5 && lng <= -87.5) return "El Salvador";
  if (lat >= 13.7 && lat <= 17.8 && lng >= -92.3 && lng <= -88.2) return "Guatemala";
  if (lat >= 12.9 && lat <= 16.0 && lng >= -89.4 && lng <= -83.1) return "Honduras";
  // Default to Mexico for broader LATAM coverage in our dataset
  return "Mexico";
}

function monthsBetween(from: Date, to: Date) {
  return Math.max(0, (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24 * 30.4375));
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const target_lat = Number(body?.target_lat);
    const target_lng = Number(body?.target_lng);
    const target_property_type = String(body?.target_property_type || "casa");
    const target_area = Number(body?.target_area || 0);

    const { canonical, group } = normalizeType(target_property_type);
    const detectedCountry = countryFromLatLng(target_lat, target_lng);

    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setMonth(cutoff.getMonth() - 24); // ≤ 24 months
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    console.log("🌎 LATAM SIMPLE SEARCH - Params:", {
      target_lat,
      target_lng,
      canonical_type: canonical,
      target_area,
      country: detectedCountry,
      cutoff: cutoffStr,
    });

    // Progressive radii (km)
    const radii = [1, 2, 5, 10, 15, 20, 25];

    // Filters
    const areaMin = target_area > 0 ? target_area * 0.7 : 0; // ±30%
    const areaMax = target_area > 0 ? target_area * 1.3 : 1_000_000_000;

    type Row = {
      id: string;
      address: string | null;
      price_usd: number | null;
      price_per_sqm_usd: number | null;
      total_area: number | null;
      latitude: number | null;
      longitude: number | null;
      property_type: string | null;
      estrato_social: string | null;
      sale_date: string | null;
      country: string | null;
      city: string | null;
      state: string | null;
    };

    const picked = new Map<string, any>();
    let usedRadius = 0;
    let usedTypeMode: "exact" | "similar" = "exact";

    // Helper to fetch for one radius + types
    const fetchFor = async (radiusKm: number, allowedTypes: string[]) => {
      const { minLat, maxLat, minLng, maxLng } = bbox(target_lat, target_lng, radiusKm);

      let query = supabase
        .from("property_comparables")
        .select(
          "id,address,price_usd,price_per_sqm_usd,total_area,latitude,longitude,property_type,estrato_social,sale_date,country,city,state"
        )
        .eq("country", detectedCountry)
        .gte("latitude", minLat)
        .lte("latitude", maxLat)
        .gte("longitude", minLng)
        .lte("longitude", maxLng)
        .gte("sale_date", cutoffStr)
        .limit(200);

      if (target_area > 0) {
        query = query.gte("total_area", areaMin).lte("total_area", areaMax);
      }

      if (allowedTypes.length === 1) {
        query = query.eq("property_type", allowedTypes[0]);
      } else {
        query = query.in("property_type", allowedTypes);
      }

      const { data, error } = await query;
      if (error) {
        console.error("❌ Query error:", error);
        return [] as Row[];
      }
      return (data || []) as Row[];
    };

    // 1) Exact type pass
    for (const r of radii) {
      const rows = await fetchFor(r, [canonical]);
      console.log(`🔎 Radius ${r}km (exact: ${canonical}) → candidates:`, rows.length);

      for (const row of rows) {
        if (!row.id || row.latitude == null || row.longitude == null || row.total_area == null) continue;
        const d = haversineKm(target_lat, target_lng, row.latitude, row.longitude);
        if (d > r) continue; // precise filter inside bbox

        const saleDate = row.sale_date ? new Date(row.sale_date) : null;
        const mOld = saleDate ? monthsBetween(saleDate, now) : 999;

        // Scoring
        const areaScore = target_area > 0 && row.total_area
          ? Math.max(0, 1 - Math.abs(row.total_area - target_area) / Math.max(row.total_area, target_area))
          : 0.5;
        const distanceScore = d <= 1 ? 1 : d <= 5 ? 0.8 : d <= 10 ? 0.6 : d <= 15 ? 0.4 : 0.2;
        const recencyScore = mOld <= 6 ? 1 : mOld <= 12 ? 0.8 : mOld <= 18 ? 0.6 : mOld <= 24 ? 0.4 : 0.2;
        const overall = 0.5 * areaScore + 0.3 * distanceScore + 0.2 * recencyScore;

        picked.set(row.id, {
          ...row,
          distance: d,
          distance_km: d,
          months_old: Math.round(mOld),
          area_similarity_score: Number(areaScore.toFixed(3)),
          overall_similarity_score: Number(overall.toFixed(3)),
          similarity_score: Math.round(overall * 100),
          selection_reason: "Exact type, LATAM simple scoring",
        });
      }

      if (picked.size >= 5) {
        usedRadius = r;
        usedTypeMode = "exact";
        break;
      }
    }

    // 2) Similar types if not enough
    if (picked.size < 3) {
      for (const r of radii) {
        const rows = await fetchFor(r, group);
        console.log(`🔁 Radius ${r}km (similar group: ${group.join(",")}) → candidates:`, rows.length);

        for (const row of rows) {
          if (!row.id || row.latitude == null || row.longitude == null || row.total_area == null) continue;
          const d = haversineKm(target_lat, target_lng, row.latitude, row.longitude);
          if (d > r) continue;

          const saleDate = row.sale_date ? new Date(row.sale_date) : null;
          const mOld = saleDate ? monthsBetween(saleDate, now) : 999;

          const areaScore = target_area > 0 && row.total_area
            ? Math.max(0, 1 - Math.abs(row.total_area - target_area) / Math.max(row.total_area, target_area))
            : 0.5;
          const distanceScore = d <= 1 ? 1 : d <= 5 ? 0.8 : d <= 10 ? 0.6 : d <= 15 ? 0.4 : 0.2;
          const recencyScore = mOld <= 6 ? 1 : mOld <= 12 ? 0.8 : mOld <= 18 ? 0.6 : mOld <= 24 ? 0.4 : 0.2;
          const overall = 0.5 * areaScore + 0.3 * distanceScore + 0.2 * recencyScore;

          if (!picked.has(row.id)) {
            picked.set(row.id, {
              ...row,
              distance: d,
              distance_km: d,
              months_old: Math.round(mOld),
              area_similarity_score: Number(areaScore.toFixed(3)),
              overall_similarity_score: Number(overall.toFixed(3)),
              similarity_score: Math.round(overall * 100),
              selection_reason: "Similar type group, LATAM simple scoring",
            });
          }
        }

        if (picked.size >= 5) {
          usedRadius = r;
          usedTypeMode = "similar";
          break;
        }
      }
    }

    const all = Array.from(picked.values());
    all.sort((a, b) => {
      if (b.overall_similarity_score !== a.overall_similarity_score) return b.overall_similarity_score - a.overall_similarity_score;
      if (a.distance !== b.distance) return a.distance - b.distance;
      return (a.months_old || 999) - (b.months_old || 999);
    });

    const top = all.slice(0, 5);

    console.log("✅ LATAM SIMPLE RESULT:", {
      count: top.length,
      usedRadiusKm: usedRadius,
      type_mode: usedTypeMode,
      country: detectedCountry,
      ids: top.map((x) => x.id),
    });

    const result = {
      data: top,
      metadata: {
        strategy_used: "latam_simple",
        country: detectedCountry,
        radius_used_km: usedRadius || (top[0]?.distance_km ? Math.ceil(top[0].distance_km) : 0),
        type_mode: usedTypeMode,
        scoring: {
          weights: { area: 0.5, distance: 0.3, recency: 0.2 },
          filters: {
            area_tolerance: "+/-30%",
            recency_months_max: 24,
            never_leave_country: true,
          },
        },
        search_parameters: {
          target_lat,
          target_lng,
          target_property_type: canonical,
          target_area,
        },
        totals: {
          considered: all.length,
          returned: top.length,
        },
        search_timestamp: new Date().toISOString(),
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("💥 LATAM SIMPLE ERROR:", error);
    return new Response(
      JSON.stringify({
        data: [],
        error: error?.message || String(error),
        metadata: {
          strategy_used: "latam_simple",
          error: true,
          search_timestamp: new Date().toISOString(),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
