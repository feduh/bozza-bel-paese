import { useEffect, useMemo, useState } from "react";
import { Pencil, Search, Building2, Check, X } from "lucide-react";
import { invokeFunction } from "@/lib/invokeFunction";

type AuthorRow = {
  user_id: string;
  display_name: string;
  affiliation: string | null;
  reality_id: string | null;
  member_type: string | null;
};

const AuthorsAffiliationPanel = () => {
  const [authors, setAuthors] = useState<AuthorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await invokeFunction<{ authors?: AuthorRow[] }>(
      "manage-user",
      { op: "list_authors" },
    );
    setLoading(false);
    if (error) {
      setFeedback({ kind: "err", text: error });
      return;
    }
    setAuthors(data?.authors ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return authors;
    return authors.filter(
      (a) =>
        a.display_name?.toLowerCase().includes(q) ||
        (a.affiliation ?? "").toLowerCase().includes(q),
    );
  }, [authors, query]);

  const startEdit = (a: AuthorRow) => {
    setEditingId(a.user_id);
    setDraft(a.affiliation ?? "");
    setFeedback(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft("");
  };

  const save = async (a: AuthorRow) => {
    setSavingId(a.user_id);
    setFeedback(null);
    const { error } = await invokeFunction("manage-user", {
      op: "set_affiliation",
      user_id: a.user_id,
      affiliation: draft.trim() || null,
    });
    setSavingId(null);
    if (error) {
      setFeedback({ kind: "err", text: error });
      return;
    }
    setFeedback({ kind: "ok", text: "Affiliazione aggiornata." });
    setEditingId(null);
    setDraft("");
    await load();
  };

  return (
    <section className="p-8 rounded-lg bg-card border border-border mt-6">
      <h2 className="font-display text-xl font-semibold mb-2 flex items-center gap-2">
        <Building2 size={20} /> Affiliazioni degli autori
      </h2>
      <p className="font-body text-sm text-muted-foreground mb-6">
        Aggiorna la realtà o l'affiliazione di riferimento degli autori del collettivo.
        Le modifiche sono visibili immediatamente nel loro profilo pubblico.
      </p>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca per nome o affiliazione…"
          className="w-full pl-9 pr-4 py-2.5 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {feedback && (
        <div
          className={`mb-4 rounded-md px-3 py-2 text-sm font-body ${
            feedback.kind === "ok"
              ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30"
              : "bg-destructive/10 text-destructive border border-destructive/30"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground font-body py-4">Caricamento…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground font-body py-4">Nessun autore trovato.</p>
      ) : (
        <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
          {filtered.map((a) => {
            const isEditing = editingId === a.user_id;
            const isSaving = savingId === a.user_id;
            const hasReality = !!a.reality_id;
            return (
              <div
                key={a.user_id}
                className="p-3 rounded-md border border-border bg-background flex items-start justify-between gap-3 flex-wrap"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-body font-medium text-sm">
                    {a.display_name || "Autore"}
                    {a.member_type === "coordinatore" && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider text-primary">
                        Coordinatore
                      </span>
                    )}
                  </p>
                  {isEditing ? (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder={hasReality ? "(sovrascrive la realtà collegata)" : "Es. Collettivo XYZ"}
                        maxLength={255}
                        className="flex-1 min-w-[220px] px-3 py-1.5 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        onClick={() => save(a)}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1 text-xs font-body px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                      >
                        <Check size={12} /> {isSaving ? "Salvo…" : "Salva"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1 text-xs font-body px-3 py-1.5 rounded-md border border-border hover:border-primary/40"
                      >
                        <X size={12} /> Annulla
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {a.affiliation
                        ? a.affiliation
                        : hasReality
                          ? "Nessuna affiliazione libera (usa la realtà collegata)"
                          : "— nessuna affiliazione —"}
                    </p>
                  )}
                </div>
                {!isEditing && (
                  <button
                    onClick={() => startEdit(a)}
                    className="inline-flex items-center gap-1 text-xs font-body px-3 py-1.5 rounded-md border border-border hover:border-primary/40 transition-colors"
                  >
                    <Pencil size={12} /> Modifica
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default AuthorsAffiliationPanel;
