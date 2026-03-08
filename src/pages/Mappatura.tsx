import { useState } from "react";
import { artRealities, type ArtReality } from "@/data/mockData";
import { MapPin, Compass, Archive } from "lucide-react";

const typeConfig: Record<ArtReality["type"], { label: string; icon: typeof MapPin; colorClass: string }> = {
  "nomade": { label: "Nomade", icon: Compass, colorClass: "bg-primary/10 text-primary border-primary/20" },
  "con-sede": { label: "Con sede", icon: MapPin, colorClass: "bg-secondary/10 text-secondary border-secondary/20" },
  "scomparsa": { label: "Scomparsa", icon: Archive, colorClass: "bg-muted text-muted-foreground border-border" },
};

const Mappatura = () => {
  const [filter, setFilter] = useState<"all" | ArtReality["type"]>("all");

  const filtered = filter === "all" ? artRealities : artRealities.filter((r) => r.type === filter);

  return (
    <div className="py-20">
      <div className="editorial-container">
        <div className="max-w-3xl mb-12">
          <h1 className="editorial-heading mb-6">
            <span className="italic text-primary">Mappatura</span> delle realtà
          </h1>
          <p className="editorial-body text-muted-foreground">
            Esplora le realtà artistiche italiane per tipologia. Ogni scheda racconta una storia di creatività e impegno culturale.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-10">
          {([["all", "Tutte"], ["nomade", "Nomadi"], ["con-sede", "Con sede"], ["scomparsa", "Scomparse"]] as const).map(
            ([val, label]) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-5 py-2 rounded-full text-sm font-body font-medium border transition-all ${
                  filter === val
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((r) => {
            const config = typeConfig[r.type];
            const Icon = config.icon;
            return (
              <div key={r.id} className="p-6 rounded-lg bg-card border border-border hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${config.colorClass}`}>
                    <Icon size={12} />
                    {config.label}
                  </span>
                  <span className="text-xs text-muted-foreground font-body">
                    {r.yearFounded}{r.yearClosed ? ` – ${r.yearClosed}` : " – oggi"}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{r.name}</h3>
                <p className="text-sm text-muted-foreground font-body flex items-center gap-1 mb-3">
                  <MapPin size={13} /> {r.city}, {r.region}
                </p>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{r.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Mappatura;
