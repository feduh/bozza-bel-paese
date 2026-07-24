import { useEffect, useMemo, useState } from "react";
import { Pencil, Search, Building2, Check, X, MapPin } from "lucide-react";
import { invokeFunction } from "@/lib/invokeFunction";

type AuthorRow = {
  user_id: string;
  display_name: string;
  affiliation: string | null;
  reality_id: string | null;
  member_type: string | null;
};

type RealityLite = {
  id: string;
  name: string;
  city: string | null;
  confirmed_status: string | null;
};

const AuthorsAffiliationPanel = () => {
  const [authors, setAuthors] = useState<AuthorRow[]>([]);
  const [realities, setRealities] = useState<RealityLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftAff, setDraftAff] = useState("");
  const [draftReality, setDraftReality] = useState<string>("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const [authorsRes, realitiesRes] = await Promise.all([
      invokeFunction<{ authors?: AuthorRow[] }>("manage-user", { op: "list_authors" }),
      invokeFunction<{ realities?: RealityLite[] }>("manage-user", { op: "list_realities_lite" }),
    ]);
    setLoading(false);
    if (authorsRes.error) {
      setFeedback({ kind: "err", text: authorsRes.error });
      return;
    }
    setAuthors(authorsRes.data?.authors ?? []);
    setRealities(realitiesRes.data?.realities ?? []);
  };

  useEffect(() => {
    void load();
  }, []);

  const realityMap = useMemo(() => {
    const m = new Map<string, RealityLite>();
    for (const r of realities) m.set(r.id, r);
    return m;
  }, [realities]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return authors;
    return authors.filter((a) => {
      const realityName = a.reality_id ? realityMap.get(a.reality_id)?.name ?? "" : "";
      return (
        a.display_name?.toLowerCase().includes(q) ||
        (a.affiliation ?? "").toLowerCase().includes(q) ||
        realityName.toLowerCase().includes(q)
      );
    });
  }, [authors, query, realityMap]);

  const startEdit = (a: AuthorRow) => {
    setEditingId(a.user_id);
    setDraftAff(a.affiliation ?? "");
    setDraftReality(a.reality_id ?? "");
    setFeedback(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftAff("");
    setDraftReality("");
  };

  const save = async (a: AuthorRow) => {
    setSavingId(a.user_id);
    setFeedback(null);

    const nextAff = draftAff.trim() || null;
    const nextReality = draftReality || null;

    const ops: Promise<{ error: string | null }>[] = [];
    if (nextAff !== (a.affiliation ?? null)) {
      ops.push(
        invokeFunction("manage-user", {
          op: "set_affiliation",
          user_id: a.user_id,
          affiliation: nextAff,
        }),
      );
    }
    if (nextReality !== (a.reality_id ?? null)) {
      ops.push(
        invokeFunction("manage-user", {
          op: "set_reality",
          user_id: a.user_id,
          reality_id: nextReality,
        }),
      );
    }

    if (ops.length === 0) {
      setSavingId(null);
      setEditingId(null);
      return;
    }

    const results = await Promise.all(ops);
    setSavingId(null);
    const firstError = results.find((r) => r.error)?.error;
    if (firstError) {
      setFeedback({ kind: "err", text: firstError });
      return;
    }
    setFeedback({ kind: "ok", text: "Modifiche salvate." });
    setEditingId(null);
    setDraftAff("");
    setDraftReality("");
    await load();
  };

  return (
    <section className="p-8 rounded-lg bg-card border border-border mt-6">
      <h2 className="font-display text-xl font-semibold mb-2 flex items-center gap-2">
        <Building2 size={20} /> Affiliazioni degli autori
      </h2>
      <p className="font-body text-sm text-muted-foreground mb-6">
        Aggiorna la realtà collegata e/o l'affiliazione libera degli autori del collettivo.
        La realtà collegata (dal menù a tendina) ha la priorità sull'affiliazione libera nel profilo pubblico.
      </p>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca per nome, affiliazione o realtà…"
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
            const linkedReality = a.reality_id ? realityMap.get(a.reality_id) : null;
            return (
              <div
                key={a.user_id}
                className="p-3 rounded-md border border-border bg-background flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="font-body font-medium text-sm">
                      {a.display_name || "Autore"}
                      {a.member_type === "coordinatore" && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider text-primary">
                          Coordinatore
                        </span>
                      )}
                    </p>
                    {!isEditing && (
                      <div className="mt-1 space-y-0.5">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin size={11} className="shrink-0" />
                          {linkedReality
                            ? `${linkedReality.name}${linkedReality.city ? ` · ${linkedReality.city}` : ""}`
                            : "— nessuna realtà collegata —"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <span className="opacity-70">Affiliazione libera:</span>{" "}
                          {a.affiliation || "—"}
                        </p>
                      </div>
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

                {isEditing && (
                  <div className="mt-1 space-y-2">
                    <label className="block">
                      <span className="text-xs font-body text-muted-foreground">
                        Realtà collegata
                      </span>
                      <select
                        value={draftReality}
                        onChange={(e) => setDraftReality(e.target.value)}
                        className="mt-1 w-full px-3 py-1.5 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">— Nessuna —</option>
                        {realities.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                            {r.city ? ` · ${r.city}` : ""}
                            {r.confirmed_status !== "confermato" ? " (pendente)" : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-body text-muted-foreground">
                        Affiliazione libera (opzionale)
                      </span>
                      <input
                        value={draftAff}
                        onChange={(e) => setDraftAff(e.target.value)}
                        placeholder="Es. Collettivo XYZ"
                        maxLength={255}
                        className="mt-1 w-full px-3 py-1.5 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
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
                  </div>
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
