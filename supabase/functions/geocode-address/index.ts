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
    const { address, city, country } = await req.json();
    if (!address || !city) {
      return new Response(
        JSON.stringify({ error: "address e city sono obbligatori" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const q = `${address}, ${city}, ${country || "Italia"}`;
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

    if (!r.ok) {
      return new Response(
        JSON.stringify({ error: `Nominatim ${r.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = (await r.json()) as NominatimResult[];
    if (!data.length) {
      return new Response(
        JSON.stringify({ error: "Indirizzo non trovato" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const hit = data[0];
    return new Response(
      JSON.stringify({
        lat: parseFloat(hit.lat),
        lng: parseFloat(hit.lon),
        zip_code: hit.address?.postcode ?? "",
        region: hit.address?.state ?? hit.address?.region ?? hit.address?.county ?? "",
        display_name: hit.display_name,
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
