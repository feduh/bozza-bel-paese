import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import topo from "world-atlas/countries-110m.json";
import type { Feature, FeatureCollection, Geometry } from "geojson";

// Costruisce una path SVG dell'Europa partendo dai confini reali dei paesi.
// Proiezione Mercator centrata sull'Europa, viewBox 1000x750.
export const EUROPE_VB = { W: 1000, H: 750, LNG_MIN: -25, LAT_MIN: 34, LNG_MAX: 45, LAT_MAX: 71 };

// elenco di paesi europei (ISO numeric come stringa, come in world-atlas)
const EUROPE_IDS = new Set([
  "008","020","040","056","070","100","112","191","196","203","208","233","234","246","250",
  "268","276","292","300","336","348","352","372","380","398","417","428","438","440","442",
  "470","492","498","499","504","528","578","616","620","642","643","674","688","703","705",
  "724","752","756","762","792","804","807","826","831","832","833",
]);

function buildPath(): string {
  const fc = feature(topo as any, (topo as any).objects.countries) as unknown as FeatureCollection<Geometry>;
  const europe: Feature<Geometry>[] = fc.features.filter((f) => EUROPE_IDS.has(String(f.id).padStart(3, "0")));

  const projection = geoMercator()
    .center([10, 52])
    .scale(620)
    .translate([EUROPE_VB.W / 2, EUROPE_VB.H / 2]);

  const path = geoPath(projection);
  return europe
    .map((f) => path(f))
    .filter(Boolean)
    .join(" ");
}

export const EUROPE_PATH = buildPath();
