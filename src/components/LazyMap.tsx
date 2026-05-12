import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
};

const buildIcon = (color: string, outline: boolean) => {
  // Active spaces: filled dot with soft glow halo + thin white ring (legibility on map)
  // Archived ("spazi che furono"): hollow dot with dashed-style colored ring
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

const LazyMap = ({ center, zoom, markers, scrollWheelZoom = false, height = "100%" }: LazyMapProps) => {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={scrollWheelZoom}
      zoomControl={false}
      style={{ height, width: "100%" }}
      className="ibp-map"
    >
      {/* Editorial-style basemap — soft, low-contrast so colored points pop */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />
      {/* Labels on top so markers stay the visual focus */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={19}
      />
      <ZoomControl position="bottomright" />
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          icon={buildIcon(m.color ?? "hsl(270 60% 58%)", !!m.outline)}
        >
          <Popup className="ibp-popup">{m.popupContent ?? m.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LazyMap;
