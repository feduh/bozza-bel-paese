import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, ZoomControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L from "leaflet";
import "leaflet.markercluster";

type MarkerData = {
  id: string;
  lat: number;
  lng: number;
  name: string;
  city?: string;
  popupContent?: React.ReactNode;
  /** CSS color (e.g. hsl(var(--primary))) */
  color?: string;
  /** If true, renders as outline-only (white interior) */
  outline?: boolean;
};

type LazyMapProps = {
  center: [number, number];
  zoom: number;
  markers: MarkerData[];
  scrollWheelZoom?: boolean;
  height?: string;
  /** Disable clustering (e.g. on the single-reality detail page) */
  cluster?: boolean;
};

const buildIcon = (color: string, outline: boolean) => {
  const html = outline
    ? `<span class="ibp-marker ibp-marker--ghost" style="--mc:${color}">
         <span class="ibp-marker__ring"></span>
         <span class="ibp-marker__core"></span>
       </span>`
    : `<span class="ibp-marker ibp-marker--solid" style="--mc:${color}">
         <span class="ibp-marker__halo"></span>
         <span class="ibp-marker__core"></span>
       </span>`;

  return L.divIcon({
    html,
    className: "ibp-marker-wrap",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const renderToHtml = (node: React.ReactNode): string => {
  // Lightweight: if string, escape; else assume the popup builder gave us safe markup.
  // Our popups in this app pass a React element; we serialize by rendering with a temporary container.
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") {
    const tmp = document.createElement("div");
    tmp.textContent = String(node);
    return tmp.innerHTML;
  }
  // Fallback: use server-style render via createElement is heavy; instead callers pass HTML strings via DOM
  return "";
};

const ClusterLayer = ({ markers, cluster }: { markers: MarkerData[]; cluster: boolean }) => {
  const map = useMap();
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    // Remove previous layer
    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    const group: L.LayerGroup = cluster
      ? (L as unknown as {
          markerClusterGroup: (opts: Record<string, unknown>) => L.LayerGroup;
        }).markerClusterGroup({
          showCoverageOnHover: false,
          spiderfyOnMaxZoom: true,
          maxClusterRadius: 50,
          iconCreateFunction: (c: { getChildCount: () => number }) => {
            const count = c.getChildCount();
            const size = count < 10 ? 36 : count < 50 ? 44 : 54;
            return L.divIcon({
              html: `<div class="ibp-cluster" style="width:${size}px;height:${size}px"><span>${count}</span></div>`,
              className: "ibp-cluster-wrap",
              iconSize: [size, size],
            });
          },
        })
      : L.layerGroup();

    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], {
        icon: buildIcon(m.color ?? "hsl(270 60% 58%)", !!m.outline),
      });

      // Build popup HTML from popupContent if it's a React element with simple content,
      // otherwise fall back to the marker name.
      const popupEl = document.createElement("div");
      popupEl.className = "ibp-popup-body";
      // We accept either string popups or rely on the name for portability.
      if (typeof m.popupContent === "string") {
        popupEl.innerHTML = m.popupContent;
      } else {
        popupEl.innerHTML = `<strong style="font-family:var(--font-display,serif)">${m.name}</strong>${
          m.city ? `<br/><span style="font-size:12px;opacity:.7">${m.city}</span>` : ""
        }`;
      }
      marker.bindPopup(popupEl);
      group.addLayer(marker);
    });

    map.addLayer(group);
    layerRef.current = group;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, markers, cluster]);

  return null;
};

const LazyMap = ({
  center,
  zoom,
  markers,
  scrollWheelZoom = false,
  height = "100%",
  cluster = true,
}: LazyMapProps) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={scrollWheelZoom}
      zoomControl={false}
      style={{ height, width: "100%" }}
      className="ibp-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />
      <ZoomControl position="bottomright" />
      <ClusterLayer markers={markers} cluster={cluster && markers.length > 1} />
    </MapContainer>
  );
};

export default LazyMap;
