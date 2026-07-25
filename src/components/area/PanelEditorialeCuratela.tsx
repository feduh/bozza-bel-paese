import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Check, X, RotateCcw, FileText, StickyNote } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type Edition = {
  id: string;
  year: number;
  title: string;
  theme_description: string | null;
  status: "draft" | "open_submissions" | "closed_submissions" | "published" | "archived";
};

type Submission = {
  id: string;
  edition_id: string;
  author_user_id: string;
  title: string;
  abstract: string;
  outline: string | null;
  references_text: string | null;
  status: "pending" | "accepted" | "rejected" | "withdrawn" | "converted";
  curator_notes: string | null;
  converted_post_id: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<Submission["status"], string> = {
  pending: "In attesa",
  accepted: "Accettata",
  rejected: "Non accettata",
  withdrawn: "Ritirata",
  converted: "Convertita",
};

const FILTERS: Array<{ v: "all" | Submission["status"]; label: string }> = [
  { v: "all", label: "Tutte" },
  { v: "pending", label: "In attesa" },
  { v: "accepted", label: "Accettate" },
  { v: "rejected", label: "Rifiutate" },
  { v: "converted", label: "Convertite" },
  { v: "withdrawn", label: "Ritirate" },
];

const PanelEditorialeCuratela = ({ userId }: { userId: string }) => {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [authorMap, setAuthorMap] = useState<Record<string, string>>({});
  const [activeEditionId, setActiveEditionId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Submission["status"]>("pending");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data: eds } = await supabase
      .from("editorial_editions")
      .select("*")
      .eq("curator_user_id", userId)
      .order("year", { ascending: false });
    const list = (eds as Edition[]) ?? [];
    setEditions(list);
    if (list.length > 0 && !activeEditionId) setActiveEditionId(list[0].id);

    if (list.length > 0) {
      const { data: subs } = await supabase
        .from("editorial_submissions")
        .select("*")
        .in(
          "edition_id",
          list.map((e) => e.id),
        )
        .order("created_at", { ascending: false });
      const sList = (subs as Submission[]) ?? [];
      setSubmissions(sList);
      const authorIds = [...new Set(sList.map((s) => s.author_user_id))];
      if (authorIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", authorIds);
        const map: Record<string, string> = {};
        (profs ?? []).forEach((p: { user_id: string; display_name: string }) => {
          map[p.user_id] = p.display_name;
        });
        setAuthorMap(map);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (activeEditionId && s.edition_id !== activeEditionId) return false;
      if (filter !== "all" && s.status !== filter) return false;
      return true;
    });
  }, [submissions, activeEditionId, filter]);

  const updateStatus = async (s: Submission, status: Submission["status"]) => {
    const { error } = await supabase
      .from("editorial_submissions")
      .update({ status })
      .eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success("Stato aggiornato");
    load();
  };

  const saveNotes = async (s: Submission, notes: string) => {
    const { error } = await supabase
      .from("editorial_submissions")
      .update({ curator_notes: notes })
      .eq("id", s.id);
    if (error) return toast.error(error.message);
    toast.success("Note salvate");
    load();
  };

  if (editions.length === 0 && !loading) {
    return (
      <section className="p-8 rounded-lg bg-card border border-border">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <BookOpen size={20} /> Curatela editoriale
        </h2>
        <p className="font-body text-sm text-muted-foreground mt-2">
          Non ti è stata ancora assegnata alcuna edizione da curare.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="p-8 rounded-lg bg-card border border-border">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <BookOpen size={20} /> Curatela editoriale
        </h2>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Valuta le candidature ricevute per l'edizione che curi. Accetta i pitch che confermi in linea con il tema
          e lascia una nota per gli autori.
        </p>
      </div>

      <div className="p-6 rounded-lg bg-card border border-border space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-body flex items-center gap-2">
            <span className="text-muted-foreground">Edizione:</span>
            <select
              value={activeEditionId ?? ""}
              onChange={(e) => setActiveEditionId(e.target.value)}
              className="px-3 py-1.5 rounded-md border border-border bg-background text-sm"
            >
              {editions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.year} — {e.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={`px-3 py-1.5 rounded-full border text-xs font-mono ${
                filter === f.v
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Caricamento…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nessuna candidatura per questo filtro.</p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((s) => (
              <SubmissionCard
                key={s.id}
                s={s}
                authorName={authorMap[s.author_user_id] ?? "Autore"}
                onStatus={(st) => updateStatus(s, st)}
                onSaveNotes={(notes) => saveNotes(s, notes)}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

const SubmissionCard = ({
  s,
  authorName,
  onStatus,
  onSaveNotes,
}: {
  s: Submission;
  authorName: string;
  onStatus: (st: Submission["status"]) => void;
  onSaveNotes: (notes: string) => void;
}) => {
  const [notes, setNotes] = useState(s.curator_notes ?? "");
  const [showNotes, setShowNotes] = useState(false);
  useEffect(() => setNotes(s.curator_notes ?? ""), [s.curator_notes]);

  return (
    <li className="p-4 rounded-md border border-border bg-background/40">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display font-semibold">{s.title}</div>
          <div className="text-xs font-mono text-muted-foreground mt-1">
            {authorName} · {new Date(s.created_at).toLocaleDateString("it-IT")}
          </div>
        </div>
        <span className="text-xs font-mono px-2 py-1 rounded border border-border bg-muted">
          {STATUS_LABEL[s.status]}
        </span>
      </div>
      <p className="text-sm mt-3 whitespace-pre-line">{s.abstract}</p>

      {(s.outline || s.references_text) && (
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer text-muted-foreground text-xs font-mono uppercase tracking-wider">
            Dettagli aggiuntivi
          </summary>
          {s.outline && (
            <div className="mt-2">
              <div className="micro-label mb-1">Scaletta</div>
              <p className="whitespace-pre-line text-sm">{s.outline}</p>
            </div>
          )}
          {s.references_text && (
            <div className="mt-2">
              <div className="micro-label mb-1">Riferimenti</div>
              <p className="whitespace-pre-line text-sm">{s.references_text}</p>
            </div>
          )}
        </details>
      )}

      {showNotes ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Note per l'autore…"
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                onSaveNotes(notes);
                setShowNotes(false);
              }}
              className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs hover:opacity-90"
            >
              Salva note
            </button>
            <button
              onClick={() => setShowNotes(false)}
              className="px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
            >
              Annulla
            </button>
          </div>
        </div>
      ) : (
        s.curator_notes && (
          <div className="mt-3 p-3 rounded-md bg-muted/40 border border-border text-sm">
            <div className="micro-label mb-1">Le tue note</div>
            {s.curator_notes}
          </div>
        )
      )}

      <div className="flex flex-wrap gap-2 mt-3">
        {s.status !== "accepted" && s.status !== "converted" && (
          <button
            onClick={() => onStatus("accepted")}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs hover:opacity-90"
          >
            <Check size={12} /> Accetta
          </button>
        )}
        {s.status !== "rejected" && s.status !== "converted" && (
          <button
            onClick={() => onStatus("rejected")}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground text-xs hover:opacity-90"
          >
            <X size={12} /> Rifiuta
          </button>
        )}
        {s.status !== "pending" && s.status !== "converted" && (
          <button
            onClick={() => onStatus("pending")}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
          >
            <RotateCcw size={12} /> Rimetti in attesa
          </button>
        )}
        <button
          onClick={() => setShowNotes((v) => !v)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
        >
          <StickyNote size={12} /> {showNotes ? "Chiudi note" : "Aggiungi/modifica note"}
        </button>
        {s.converted_post_id && (
          <Link
            to={`/area-personale/articolo/${s.converted_post_id}/modifica`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
          >
            <FileText size={12} /> Apri bozza
          </Link>
        )}
      </div>
    </li>
  );
};

export default PanelEditorialeCuratela;
