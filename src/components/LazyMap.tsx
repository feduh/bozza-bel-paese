import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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
  const fill = outline ? "#ffffff" : color;
  const html = `<span style="
    display:block;width:18px;height:18px;border-radius:9999px;
    background:${fill};border:3px solid ${color};
    box-shadow:0 1px 4px rgba(0,0,0,0.35);
  "></span>`;
  return L.divIcon({
    html,
    className: "ilbelpaese-marker",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -9],
  });
};

const LazyMap = ({ center, zoom, markers, scrollWheelZoom = false, height = "100%" }: LazyMapProps) => {
  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom={scrollWheelZoom} style={{ height, width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          icon={buildIcon(m.color ?? "hsl(270 60% 58%)", !!m.outline)}
        >
          <Popup>{m.popupContent ?? m.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LazyMap;
