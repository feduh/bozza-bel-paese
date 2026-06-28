// Geocodifica un indirizzo via Nominatim (OpenStreetMap) — nessuna API key richiesta.
// Replica la logica di onEdit del foglio Google: dato address+city+country
// ritorna { zip_code, region, lat, lng, display_name }.

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    postcode?: string;
    state?: string;
    region?: string;
    county?: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Require an authenticated user — geocoding is restricted to signed-in members.
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { address, city, country } = await req.json();
    if (!address || !city) {
      return new Response(
        JSON.stringify({ error: "address e city sono obbligatori" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const search = async (q: string) => {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", q);
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("limit", "1");
      url.searchParams.set("countrycodes", "it");
      const r = await fetch(url, {
        headers: {
          "User-Agent": "IlBelPaese/1.0 (lovable.app)",
          "Accept-Language": "it",
        },
      });
      if (!r.ok) throw new Error(`Nominatim ${r.status}`);
      return (await r.json()) as NominatimResult[];
    };

    const co = country || "Italia";
    // 1) full address  2) address + city  3) city + country (approximate)
    const attempts = [
      `${address}, ${city}, ${co}`,
      `${address}, ${city}`,
      `${city}, ${co}`,
    ];

    let hit: NominatimResult | null = null;
    let approximate = false;
    for (let i = 0; i < attempts.length; i++) {
      try {
        const data = await search(attempts[i]);
        if (data.length) {
          hit = data[0];
          approximate = i === attempts.length - 1;
          break;
        }
      } catch (_) {
        // try next
      }
    }

    if (!hit) {
      return new Response(
        JSON.stringify({ error: "Indirizzo non trovato. Verifica via, città e CAP, oppure inserisci manualmente lat/lng." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        lat: parseFloat(hit.lat),
        lng: parseFloat(hit.lon),
        zip_code: hit.address?.postcode ?? "",
        region: hit.address?.state ?? hit.address?.region ?? hit.address?.county ?? "",
        display_name: hit.display_name,
        approximate,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
