import { useParams, Link } from "react-router-dom";
import { artRealities } from "@/data/mockData";
import { MapPin, Calendar, ArrowLeft, Globe, Compass, Archive } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const typeLabels = {
  "nomade": { label: "Nomade", icon: Compass, colorClass: "bg-primary/10 text-primary border-primary/20" },
  "con-sede": { label: "Con sede", icon: MapPin, colorClass: "bg-secondary/10 text-secondary border-secondary/20" },
  "scomparsa": { label: "Scomparsa", icon: Archive, colorClass: "bg-muted text-muted-foreground border-border" },
};

const RealityDetail = () => {
  const { id } = useParams();
  const reality = artRealities.find((r) => r.id === id);

  if (!reality) {
    return (
      <div className="py-20 text-center editorial-container">
        <h1 className="editorial-heading mb-4">Realtà non trovata</h1>
        <Link to="/mappatura" className="text-primary hover:underline">Torna alla mappatura</Link>
      </div>
    );
  }

  const config = typeLabels[reality.type];
  const Icon = config.icon;

  return (
    <div className="py-12">
      <div className="editorial-container">
        {/* Back link */}
        <Link to="/mappatura" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft size={16} /> Torna alla mappatura
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${config.colorClass}`}>
              <Icon size={12} /> {config.label}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin size={13} /> {reality.city}, {reality.region}
            </span>
          </div>
          <h1 className="editorial-heading mb-4">{reality.name}</h1>
          <p className="editorial-body text-muted-foreground max-w-3xl">{reality.description}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* History */}
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Storia</h2>
              <p className="font-body text-muted-foreground leading-relaxed">{reality.history}</p>
            </section>

            {/* Map */}
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Posizione</h2>
              <div className="rounded-lg overflow-hidden border border-border h-[400px]">
                <MapContainer
                  center={[reality.lat, reality.lng]}
                  zoom={14}
                  scrollWheelZoom={false}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[reality.lat, reality.lng]}>
                    <Popup>{reality.name}<br />{reality.city}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Info card */}
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-display text-lg font-semibold mb-4">Informazioni</h3>
              <dl className="space-y-3 text-sm font-body">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Fondazione</dt>
                  <dd className="font-medium">{reality.yearFounded}</dd>
                </div>
                {reality.yearClosed && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Chiusura</dt>
                    <dd className="font-medium">{reality.yearClosed}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Stato</dt>
                  <dd className="font-medium">{reality.yearClosed ? "Non attiva" : "Attiva"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Città</dt>
                  <dd className="font-medium">{reality.city}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Regione</dt>
                  <dd className="font-medium">{reality.region}</dd>
                </div>
                {reality.website && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Sito web</dt>
                    <dd>
                      <a href={reality.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                        <Globe size={12} /> Visita
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Disciplines */}
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-display text-lg font-semibold mb-4">Discipline</h3>
              <div className="flex flex-wrap gap-2">
                {reality.disciplines.map((d) => (
                  <span key={d} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default RealityDetail;
