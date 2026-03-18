import { useState, useEffect, lazy, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Calendar, ArrowLeft, Globe, Compass, Archive } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import MapFallback from "@/components/MapFallback";

const LazyMap = lazy(() => import("@/components/LazyMap"));

type RealityType = "nomade" | "con-sede" | "scomparsa";

const typeLabels: Record<RealityType, { label: string; icon: typeof MapPin; colorClass: string }> = {
  nomade: { label: "Nomade", icon: Compass, colorClass: "bg-primary/10 text-primary border-primary/20" },
  "con-sede": { label: "Con sede", icon: MapPin, colorClass: "bg-secondary/10 text-secondary border-secondary/20" },
  scomparsa: { label: "Scomparsa", icon: Archive, colorClass: "bg-muted text-muted-foreground border-border" },
};

const RealityDetail = () => {
  const { id } = useParams();
  const [reality, setReality] = useState<any>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("realities").select("*").eq("id", id!).single();
      if (data) {
        setReality(data);
        const { data: tagsData } = await supabase.from("reality_tags").select("tag").eq("reality_id", id!);
        setTags(tagsData?.map((t) => t.tag) ?? []);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center"><p className="text-muted-foreground font-body">Caricamento...</p></div>;
  }

  if (!reality) {
    return (
      <div className="py-20 text-center editorial-container">
        <h1 className="editorial-heading mb-4">Realtà non trovata</h1>
        <Link to="/mappatura" className="text-primary hover:underline">Torna alla mappatura</Link>
      </div>
    );
  }

  const config = typeLabels[reality.type as RealityType];
  const Icon = config.icon;

  return (
    <div className="py-12">
      <div className="editorial-container">
        <Link to="/mappatura" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft size={16} /> Torna alla mappatura
        </Link>

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
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Storia</h2>
              <p className="font-body text-muted-foreground leading-relaxed">{reality.history}</p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Posizione</h2>
              <div className="rounded-lg overflow-hidden border border-border h-[400px]">
                <Suspense fallback={<MapFallback height="400px" />}>
                  <LazyMap
                    center={[reality.lat, reality.lng]}
                    zoom={14}
                    markers={[
                      {
                        id: reality.id,
                        lat: reality.lat,
                        lng: reality.lng,
                        name: reality.name,
                        popupContent: <>{reality.name}<br />{reality.city}</>,
                      },
                    ]}
                  />
                </Suspense>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-display text-lg font-semibold mb-4">Informazioni</h3>
              <dl className="space-y-3 text-sm font-body">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Fondazione</dt>
                  <dd className="font-medium">{reality.year_founded}</dd>
                </div>
                {reality.year_closed && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Chiusura</dt>
                    <dd className="font-medium">{reality.year_closed}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Stato</dt>
                  <dd className="font-medium">{reality.year_closed ? "Non attiva" : "Attiva"}</dd>
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

            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-display text-lg font-semibold mb-4">Discipline</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((d) => (
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
