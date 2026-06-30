import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Plus, Hourglass, Pencil, Search } from "lucide-react";
import RealityForm from "@/components/RealityForm";
import { supabase } from "@/integrations/supabase/client";
import type { AreaPendingReality } from "./types";

type Props = {
  isAdmin: boolean;
  pending: AreaPendingReality[];
  onCreated: () => void;
};

type RealityRow = {
  id: string;
  name: string;
  city: string | null;
  region: string | null;
  confirmed_status: string | null;
};

const PanelRealta = ({ isAdmin, pending, onCreated }: Props) => {
  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Admin search of existing realities
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RealityRow[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoadingList(true);
    const handle = setTimeout(async () => {
      let q = supabase
        .from("realities")
        .select("id, name, city, region, confirmed_status")
        .order("name", { ascending: true })
        .limit(50);
      if (query.trim()) {
        q = q.ilike("name", `%${query.trim()}%`);
      }
      const { data } = await q;
      if (!alive) return;
      setResults((data as RealityRow[]) ?? []);
      setLoadingList(false);
    }, 250);
    return () => { alive = false; clearTimeout(handle); };
  }, [isAdmin, query]);

  const closeEditor = () => {
    setEditingId(null);
    setShowNew(false);
  };

  if (editingId) {
    return (
      <section className="p-8 rounded-lg bg-card border border-border">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <Pencil size={20} /> Modifica realtà
          </h2>
        </div>
        <RealityForm
          mode={isAdmin ? "admin" : "coordinatore"}
          editingId={editingId}
          onCreated={() => {
            closeEditor();
            onCreated();
          }}
          onCancel={closeEditor}
        />
      </section>
    );
  }

  return (
    <section className="p-8 rounded-lg bg-card border border-border space-y-10">
      <div>
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
            onCancel={() => setShowNew(false)}
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingId(r.id)}
                        className="inline-flex items-center gap-1 text-xs font-body px-3 py-1.5 rounded-md border border-border hover:border-primary/40 transition-colors"
                      >
                        <Pencil size={12} /> Modifica
                      </button>
                      <Link
                        to={`/realta/${r.id}`}
                        className="text-xs font-body px-3 py-1.5 rounded-md border border-border hover:border-primary/40 transition-colors"
                      >
                        Anteprima
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {(
        <div className="pt-8 border-t border-border")
          <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Pencil size={18} /> Modifica realtà esistenti
          </h3>
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca per nome…"
              className="w-full pl-9 pr-4 py-2.5 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {loadingList ? (
            <p className="text-sm text-muted-foreground font-body py-4">Caricamento…</p>
          ) : results.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body py-4">Nessuna realtà trovata.</p>
          ) : (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {results.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-md border border-border bg-background flex items-center justify-between gap-3 flex-wrap"
                >
                  <div className="min-w-0">
                    <p className="font-body font-medium text-sm truncate">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.city ?? "—"}
                      {r.region ? ` · ${r.region}` : ""}
                      {r.confirmed_status ? ` · ${r.confirmed_status}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingId(r.id)}
                      className="inline-flex items-center gap-1 text-xs font-body px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90"
                    >
                      <Pencil size={12} /> Modifica
                    </button>
                    <Link
                      to={`/realta/${r.id}`}
                      className="text-xs font-body px-3 py-1.5 rounded-md border border-border hover:border-primary/40 transition-colors"
                    >
                      Vedi
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-muted-foreground font-body">
            Massimo 50 risultati. Affina la ricerca per nome.
          </p>
        </div>
      )}
    </section>
  );
};

export default PanelRealta;
