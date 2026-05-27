import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Plus, Hourglass } from "lucide-react";
import RealityForm from "@/components/RealityForm";
import type { AreaPendingReality } from "./types";

type Props = {
  isAdmin: boolean;
  pending: AreaPendingReality[];
  onCreated: () => void;
};

const PanelRealta = ({ isAdmin, pending, onCreated }: Props) => {
  const [showNew, setShowNew] = useState(false);

  return (
    <section className="p-8 rounded-lg bg-card border border-border">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <MapPin size={20} /> Proponi una nuova realtà
        </h2>
        <button
          onClick={() => setShowNew((s) => !s)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-body font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={14} /> {showNew ? "Chiudi form" : "Nuova realtà"}
        </button>
      </div>
      {showNew && (
        <RealityForm
          mode={isAdmin ? "admin" : "coordinatore"}
          onCreated={() => {
            setShowNew(false);
            onCreated();
          }}
        />
      )}

      {pending.length > 0 && (
        <div className="mt-8">
          <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
            <Hourglass size={14} className="text-amber-600" /> Le tue proposte in verifica
          </h3>
          <div className="space-y-2">
            {pending.map((r) => {
              const ms = r.auto_confirm_at ? new Date(r.auto_confirm_at).getTime() - Date.now() : 0;
              const hours = Math.max(0, Math.floor(ms / 3600000));
              const mins = Math.max(0, Math.floor((ms % 3600000) / 60000));
              const ready = ms <= 0;
              return (
                <div
                  key={r.id}
                  className="p-3 rounded-md border border-amber-500/30 bg-amber-500/5 flex items-center justify-between gap-3 flex-wrap"
                >
                  <div className="min-w-0">
                    <p className="font-body font-medium text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.city}
                      {r.region ? ` · ${r.region}` : ""} ·{" "}
                      {ready ? "in pubblicazione automatica" : `pubblicazione tra ${hours}h ${mins}m`}
                    </p>
                  </div>
                  <Link
                    to={`/realta/${r.id}`}
                    className="text-xs font-body px-3 py-1.5 rounded-md border border-border hover:border-primary/40 transition-colors"
                  >
                    Anteprima
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default PanelRealta;
