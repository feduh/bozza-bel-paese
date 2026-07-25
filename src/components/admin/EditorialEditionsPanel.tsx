import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Plus, Save, Trash2, User } from "lucide-react";
import { toast } from "sonner";

type Edition = {
  id: string;
  year: number;
  title: string;
  theme_description: string | null;
  curator_user_id: string | null;
  status: "draft" | "open_submissions" | "closed_submissions" | "published" | "archived";
  submissions_open_at: string | null;
  submissions_close_at: string | null;
  cover_image_url: string | null;
};

type Author = { user_id: string; display_name: string };

const STATUS_LABEL: Record<Edition["status"], string> = {
  draft: "Bozza",
  open_submissions: "Candidature aperte",
  closed_submissions: "Candidature chiuse",
  published: "Pubblicata",
  archived: "Archiviata",
};

const emptyForm = (): Omit<Edition, "id"> => ({
  year: new Date().getFullYear(),
  title: "",
  theme_description: "",
  curator_user_id: null,
  status: "draft",
  submissions_open_at: null,
  submissions_close_at: null,
  cover_image_url: null,
});

const toLocal = (v: string | null) => (v ? new Date(v).toISOString().slice(0, 16) : "");
const fromLocal = (v: string) => (v ? new Date(v).toISOString() : null);

const EditorialEditionsPanel = () => {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState<Omit<Edition, "id">>(emptyForm());
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: eds }, { data: rolesData }] = await Promise.all([
      supabase.from("editorial_editions").select("*").order("year", { ascending: false }),
      supabase.from("user_roles").select("user_id").in("role", ["admin", "coordinatore", "author"]),
    ]);
    setEditions((eds as Edition[]) ?? []);
    const ids = [...new Set((rolesData ?? []).map((r: { user_id: string }) => r.user_id))];
    if (ids.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", ids);
      setAuthors((profs as Author[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const createEdition = async () => {
    if (!newForm.title.trim()) {
      toast.error("Inserisci un titolo per l'edizione");
      return;
    }
    const { error } = await supabase.from("editorial_editions").insert({
      ...newForm,
      theme_description: newForm.theme_description || null,
      cover_image_url: newForm.cover_image_url || null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Edizione creata");
    setShowNew(false);
    setNewForm(emptyForm());
    load();
  };

  const saveEdition = async (ed: Edition) => {
    setSavingId(ed.id);
    const { id, ...rest } = ed;
    const { error } = await supabase.from("editorial_editions").update(rest).eq("id", id);
    setSavingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Edizione aggiornata");
    load();
  };

  const deleteEdition = async (id: string) => {
    if (!confirm("Eliminare questa edizione? Verranno rimosse anche le candidature collegate.")) return;
    const { error } = await supabase.from("editorial_editions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Edizione eliminata");
    load();
  };

  return (
    <section className="p-8 rounded-lg bg-card border border-border space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <BookOpen size={20} /> Edizioni editoriali
          </h2>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Crea le edizioni annuali dell'Editoriale, assegna il curatore e gestisci le finestre di candidatura.
          </p>
        </div>
        <button
          onClick={() => setShowNew((s) => !s)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-body font-medium hover:opacity-90"
        >
          <Plus size={14} /> {showNew ? "Chiudi" : "Nuova edizione"}
        </button>
      </div>

      {showNew && (
        <div className="p-5 rounded-md border border-border bg-background/50 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm font-body">
              <span className="block mb-1 text-muted-foreground">Anno</span>
              <input
                type="number"
                value={newForm.year}
                onChange={(e) => setNewForm({ ...newForm, year: parseInt(e.target.value || "0", 10) })}
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
              />
            </label>
            <label className="text-sm font-body">
              <span className="block mb-1 text-muted-foreground">Titolo</span>
              <input
                type="text"
                value={newForm.title}
                onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                placeholder="Edizione 2026 — Geografie minori"
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
              />
            </label>
          </div>
          <label className="block text-sm font-body">
            <span className="block mb-1 text-muted-foreground">Descrizione del tema</span>
            <textarea
              rows={3}
              value={newForm.theme_description ?? ""}
              onChange={(e) => setNewForm({ ...newForm, theme_description: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-border bg-background"
            />
          </label>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm font-body">
              <span className="block mb-1 text-muted-foreground">Curatore</span>
              <select
                value={newForm.curator_user_id ?? ""}
                onChange={(e) => setNewForm({ ...newForm, curator_user_id: e.target.value || null })}
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
              >
                <option value="">— Non assegnato —</option>
                {authors.map((a) => (
                  <option key={a.user_id} value={a.user_id}>
                    {a.display_name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-body">
              <span className="block mb-1 text-muted-foreground">Stato</span>
              <select
                value={newForm.status}
                onChange={(e) => setNewForm({ ...newForm, status: e.target.value as Edition["status"] })}
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
              >
                {(Object.keys(STATUS_LABEL) as Edition["status"][]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm font-body">
              <span className="block mb-1 text-muted-foreground">Apertura candidature</span>
              <input
                type="datetime-local"
                value={toLocal(newForm.submissions_open_at)}
                onChange={(e) => setNewForm({ ...newForm, submissions_open_at: fromLocal(e.target.value) })}
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
              />
            </label>
            <label className="text-sm font-body">
              <span className="block mb-1 text-muted-foreground">Chiusura candidature</span>
              <input
                type="datetime-local"
                value={toLocal(newForm.submissions_close_at)}
                onChange={(e) => setNewForm({ ...newForm, submissions_close_at: fromLocal(e.target.value) })}
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
              />
            </label>
          </div>
          <button
            onClick={createEdition}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            <Save size={14} /> Crea edizione
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Caricamento…</p>
      ) : editions.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nessuna edizione ancora. Creane una per iniziare.</p>
      ) : (
        <div className="space-y-4">
          {editions.map((ed) => (
            <EditionRow
              key={ed.id}
              edition={ed}
              authors={authors}
              saving={savingId === ed.id}
              onSave={saveEdition}
              onDelete={() => deleteEdition(ed.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

const EditionRow = ({
  edition,
  authors,
  saving,
  onSave,
  onDelete,
}: {
  edition: Edition;
  authors: Author[];
  saving: boolean;
  onSave: (ed: Edition) => void;
  onDelete: () => void;
}) => {
  const [ed, setEd] = useState(edition);
  useEffect(() => setEd(edition), [edition]);
  const curator = authors.find((a) => a.user_id === ed.curator_user_id);
  return (
    <div className="p-5 rounded-md border border-border bg-background/40 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-xs px-2 py-1 rounded bg-muted">{ed.year}</span>
          <span className="font-display text-lg font-semibold truncate">{ed.title}</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <User size={12} /> {curator?.display_name ?? "— non assegnato —"}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <input
          type="text"
          value={ed.title}
          onChange={(e) => setEd({ ...ed, title: e.target.value })}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
        />
        <select
          value={ed.curator_user_id ?? ""}
          onChange={(e) => setEd({ ...ed, curator_user_id: e.target.value || null })}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
        >
          <option value="">— Non assegnato —</option>
          {authors.map((a) => (
            <option key={a.user_id} value={a.user_id}>
              {a.display_name}
            </option>
          ))}
        </select>
      </div>
      <textarea
        rows={2}
        value={ed.theme_description ?? ""}
        onChange={(e) => setEd({ ...ed, theme_description: e.target.value })}
        placeholder="Descrizione del tema…"
        className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
      />
      <div className="grid md:grid-cols-3 gap-3">
        <select
          value={ed.status}
          onChange={(e) => setEd({ ...ed, status: e.target.value as Edition["status"] })}
          className="px-3 py-2 rounded-md border border-border bg-background text-sm"
        >
          {(Object.keys(STATUS_LABEL) as Edition["status"][]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={toLocal(ed.submissions_open_at)}
          onChange={(e) => setEd({ ...ed, submissions_open_at: fromLocal(e.target.value) })}
          className="px-3 py-2 rounded-md border border-border bg-background text-sm"
        />
        <input
          type="datetime-local"
          value={toLocal(ed.submissions_close_at)}
          onChange={(e) => setEd({ ...ed, submissions_close_at: fromLocal(e.target.value) })}
          className="px-3 py-2 rounded-md border border-border bg-background text-sm"
        />
      </div>
      <input
        type="url"
        value={ed.cover_image_url ?? ""}
        onChange={(e) => setEd({ ...ed, cover_image_url: e.target.value || null })}
        placeholder="URL immagine di copertina (opzionale)"
        className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
      />
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={() => onSave(ed)}
          disabled={saving}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50"
        >
          <Save size={12} /> {saving ? "Salvo…" : "Salva"}
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-destructive/40 text-destructive text-xs font-medium hover:bg-destructive/10"
        >
          <Trash2 size={12} /> Elimina
        </button>
      </div>
    </div>
  );
};

export default EditorialEditionsPanel;
