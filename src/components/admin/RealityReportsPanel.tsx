import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Inbox, Archive, CheckCircle2, Loader2, Trash2, Mail, Globe } from "lucide-react";

type Report = {
  id: string;
  name: string;
  city: string | null;
  region: string | null;
  description: string | null;
  website: string | null;
  contact_email: string | null;
  reporter_name: string | null;
  reporter_email: string | null;
  status: "nuova" | "in_lavorazione" | "archiviata" | "convertita";
  admin_notes: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<Report["status"], string> = {
  nuova: "Nuova",
  in_lavorazione: "In lavorazione",
  archiviata: "Archiviata",
  convertita: "Convertita",
};

const STATUS_OPTIONS: Report["status"][] = ["nuova", "in_lavorazione", "convertita", "archiviata"];

const RealityReportsPanel = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Report["status"] | "all">("nuova");

  const fetchReports = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reality_reports")
      .select("*")
      .order("created_at", { ascending: false });
    setReports((data as Report[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const updateStatus = async (id: string, status: Report["status"]) => {
    await supabase.from("reality_reports").update({ status }).eq("id", id);
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const updateNotes = async (id: string, admin_notes: string) => {
    await supabase.from("reality_reports").update({ admin_notes }).eq("id", id);
  };

  const remove = async (id: string) => {
    if (!confirm("Eliminare definitivamente questa segnalazione?")) return;
    await supabase.from("reality_reports").delete().eq("id", id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);
  const counts = reports.reduce(
    (acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; },
    {} as Record<Report["status"], number>,
  );

  return (
    <div className="p-8 rounded-lg bg-card border border-border mb-12">
      <h2 className="font-display text-xl font-semibold mb-2 flex items-center gap-2">
        <Inbox size={20} /> Segnalazioni realtà
      </h2>
      <p className="text-sm text-muted-foreground font-body mb-6">
        Realtà artistiche proposte dal pubblico tramite il form di segnalazione.
      </p>

      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Filtra per stato">
        <button
          onClick={() => setFilter("all")}
          role="tab"
          aria-selected={filter === "all"}
          className={`px-3 py-1.5 rounded-md text-xs font-body uppercase tracking-wider transition-colors ${
            filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
          }`}
        >
          Tutte ({reports.length})
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            role="tab"
            aria-selected={filter === s}
            className={`px-3 py-1.5 rounded-md text-xs font-body uppercase tracking-wider transition-colors ${
              filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {STATUS_LABELS[s]} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground font-body inline-flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" /> Caricamento…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground font-body italic">
          Nessuna segnalazione in questo stato.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <article key={r.id} className="p-5 rounded-md border border-border bg-background">
              <header className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-base">{r.name}</h3>
                  {(r.city || r.region) && (
                    <p className="text-xs text-muted-foreground font-body mt-0.5">
                      {[r.city, r.region].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={r.status}
                    onChange={(e) => updateStatus(r.id, e.target.value as Report["status"])}
                    aria-label="Cambia stato"
                    className="px-2 py-1 rounded border border-input bg-background text-xs font-body"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => remove(r.id)}
                    aria-label="Elimina segnalazione"
                    className="p-1.5 rounded text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </header>

              {r.description && (
                <p className="text-sm font-body text-foreground/90 whitespace-pre-line mb-3">{r.description}</p>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-body text-muted-foreground mb-3">
                {r.website && (
                  <a href={r.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-primary">
                    <Globe size={12} /> {r.website}
                  </a>
                )}
                {r.contact_email && (
                  <a href={`mailto:${r.contact_email}`} className="inline-flex items-center gap-1 hover:text-primary">
                    <Mail size={12} /> {r.contact_email}
                  </a>
                )}
                {(r.reporter_name || r.reporter_email) && (
                  <span>
                    Segnalata da: {r.reporter_name || "—"}
                    {r.reporter_email && <> · <a href={`mailto:${r.reporter_email}`} className="hover:text-primary">{r.reporter_email}</a></>}
                  </span>
                )}
                <span>{new Date(r.created_at).toLocaleString("it-IT")}</span>
              </div>

              <textarea
                defaultValue={r.admin_notes ?? ""}
                onBlur={(e) => {
                  const v = e.target.value;
                  if (v !== (r.admin_notes ?? "")) updateNotes(r.id, v);
                }}
                placeholder="Note interne (autosalvate)"
                rows={2}
                className="w-full mt-1 px-3 py-2 rounded border border-input bg-background text-xs font-body focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default RealityReportsPanel;
