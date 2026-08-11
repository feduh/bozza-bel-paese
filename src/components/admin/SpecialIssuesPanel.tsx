import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, Plus, Save, Trash2, User } from "lucide-react";
import { toast } from "sonner";

type Status = "draft" | "open_submissions" | "closed_submissions" | "published" | "archived";

type SpecialIssue = {
  id: string;
  edition_id: string;
  title: string;
  slug: string;
  theme_description: string | null;
  guest_editor_user_id: string | null;
  status: Status;
  position: number;
  submissions_open_at: string | null;
  submissions_close_at: string | null;
  cover_image_url: string | null;
};

type Edition = { id: string; year: number; title: string };
type Author = { user_id: string; display_name: string };

const STATUS_LABEL: Record<Status, string> = {
  draft: "Bozza",
  open_submissions: "Candidature aperte",
  closed_submissions: "Candidature chiuse",
  published: "Pubblicato",
  archived: "Archiviato",
};

const toLocal = (v: string | null) => (v ? new Date(v).toISOString().slice(0, 16) : "");
const fromLocal = (v: string) => (v ? new Date(v).toISOString() : null);
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

const SpecialIssuesPanel = () => {
  const [issues, setIssues] = useState<SpecialIssue[]>([]);
  const [editions, setEditions] = useState<Edition[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [newForm, setNewForm] = useState({
    edition_id: "",
    title: "",
    theme_description: "",
    guest_editor_user_id: "",
    status: "draft" as Status,
    submissions_open_at: null as string | null,
    submissions_close_at: null as string | null,
  });

  const load = async () => {
    setLoading(true);
    const [{ data: eds }, { data: sis }, { data: rolesData }] = await Promise.all([
      supabase.from("editorial_editions").select("id, year, title").order("year", { ascending: false }),
      supabase
        .from("editorial_special_issues")
        .select("*")
        .order("position", { ascending: true }),
      supabase.from("user_roles").select("user_id").in("role", ["admin", "coordinatore", "author"]),
    ]);
    setEditions((eds as Edition[]) ?? []);
    setIssues((sis as SpecialIssue[]) ?? []);
    const ids = [...new Set((rolesData ?? []).map((r: { user_id: string }) => r.user_id))];
    if (ids.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("user_id, display_name").in("user_id", ids);
      setAuthors((profs as Author[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    if (!newForm.edition_id) return toast.error("Scegli l'annata di riferimento");
    if (!newForm.title.trim()) return toast.error("Inserisci un titolo");
    const { error } = await supabase.from("editorial_special_issues").insert({
      edition_id: newForm.edition_id,
      title: newForm.title.trim(),
      slug: slugify(newForm.title),
      theme_description: newForm.theme_description || null,
      guest_editor_user_id: newForm.guest_editor_user_id || null,
      status: newForm.status,
      submissions_open_at: newForm.submissions_open_at,
      submissions_close_at: newForm.submissions_close_at,
    });
    if (error) return toast.error(error.message);
    toast.success("Special Issue creato");
    setShowNew(false);
    setNewForm({
      edition_id: "",
      title: "",
      theme_description: "",
      guest_editor_user_id: "",
      status: "draft",
      submissions_open_at: null,
      submissions_close_at: null,
    });
    load();
  };

  const save = async (si: SpecialIssue) => {
    setSavingId(si.id);
    const { id, ...rest } = si;
    const { error } = await supabase.from("editorial_special_issues").update(rest).eq("id", id);
    setSavingId(null);
    if (error) return toast.error(error.message);
    toast.success("Special Issue aggiornato");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Eliminare questo Special Issue? I contributi collegati resteranno nell'annata.")) return;
    const { error } = await supabase.from("editorial_special_issues").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Special Issue eliminato");
    load();
  };

  return (
    <section className="p-8 rounded-lg bg-card border border-border space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <Megaphone size={20} /> Special Issue
          </h2>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Numeri speciali dentro un'annata: tema proprio, guest editor e open call con deadline separata
            da quella dell'Editoriale.
          </p>
        </div>
        <button
          onClick={() => setShowNew((s) => !s)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-body font-medium hover:opacity-90"
        >
          <Plus size={14} /> {showNew ? "Chiudi" : "Nuovo Special Issue"}
        </button>
      </div>

      {showNew && (
        <div className="p-5 rounded-md border border-border bg-background/50 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm font-body">
              <span className="block mb-1 text-muted-foreground">Annata</span>
              <select
                value={newForm.edition_id}
                onChange={(e) => setNewForm({ ...newForm, edition_id: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
              >
                <option value="">— Seleziona —</option>
                {editions.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.year} — {e.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-body">
              <span className="block mb-1 text-muted-foreground">Titolo</span>
              <input
                type="text"
                value={newForm.title}
                onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                placeholder="Special Issue — Corpi e periferie"
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
              />
            </label>
          </div>
          <label className="block text-sm font-body">
            <span className="block mb-1 text-muted-foreground">Tema dello Special Issue</span>
            <textarea
              rows={3}
              value={newForm.theme_description}
              onChange={(e) => setNewForm({ ...newForm, theme_description: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-border bg-background"
            />
          </label>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm font-body">
              <span className="block mb-1 text-muted-foreground">Guest editor</span>
              <select
                value={newForm.guest_editor_user_id}
                onChange={(e) => setNewForm({ ...newForm, guest_editor_user_id: e.target.value })}
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
                onChange={(e) => setNewForm({ ...newForm, status: e.target.value as Status })}
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
              >
                {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm font-body">
              <span className="block mb-1 text-muted-foreground">Apertura open call</span>
              <input
                type="datetime-local"
                value={toLocal(newForm.submissions_open_at)}
                onChange={(e) => setNewForm({ ...newForm, submissions_open_at: fromLocal(e.target.value) })}
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
              />
            </label>
            <label className="text-sm font-body">
              <span className="block mb-1 text-muted-foreground">Deadline open call</span>
              <input
                type="datetime-local"
                value={toLocal(newForm.submissions_close_at)}
                onChange={(e) => setNewForm({ ...newForm, submissions_close_at: fromLocal(e.target.value) })}
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
              />
            </label>
          </div>
          <button
            onClick={create}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            <Save size={14} /> Crea Special Issue
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Caricamento…</p>
      ) : issues.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nessuno Special Issue. Creane uno per aprire una seconda open call dentro l'annata.
        </p>
      ) : (
        <div className="space-y-4">
          {issues.map((si) => (
            <IssueRow
              key={si.id}
              issue={si}
              editions={editions}
              authors={authors}
              saving={savingId === si.id}
              onSave={save}
              onDelete={() => remove(si.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

const IssueRow = ({
  issue,
  editions,
  authors,
  saving,
  onSave,
  onDelete,
}: {
  issue: SpecialIssue;
  editions: Edition[];
  authors: Author[];
  saving: boolean;
  onSave: (si: SpecialIssue) => void;
  onDelete: () => void;
}) => {
  const [si, setSi] = useState(issue);
  useEffect(() => setSi(issue), [issue]);
  const guest = authors.find((a) => a.user_id === si.guest_editor_user_id);
  const edition = editions.find((e) => e.id === si.edition_id);

  return (
    <div className="p-5 rounded-md border border-border bg-background/40 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-xs px-2 py-1 rounded bg-muted">{edition?.year ?? "—"}</span>
          <span className="font-display text-lg font-semibold truncate">{si.title}</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <User size={12} /> {guest?.display_name ?? "— guest editor non assegnato —"}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <input
          type="text"
          value={si.title}
          onChange={(e) => setSi({ ...si, title: e.target.value })}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
        />
        <select
          value={si.guest_editor_user_id ?? ""}
          onChange={(e) => setSi({ ...si, guest_editor_user_id: e.target.value || null })}
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
        value={si.theme_description ?? ""}
        onChange={(e) => setSi({ ...si, theme_description: e.target.value })}
        placeholder="Tema dello Special Issue…"
        className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
      />
      <div className="grid md:grid-cols-4 gap-3">
        <select
          value={si.edition_id}
          onChange={(e) => setSi({ ...si, edition_id: e.target.value })}
          className="px-3 py-2 rounded-md border border-border bg-background text-sm"
        >
          {editions.map((e) => (
            <option key={e.id} value={e.id}>
              {e.year}
            </option>
          ))}
        </select>
        <select
          value={si.status}
          onChange={(e) => setSi({ ...si, status: e.target.value as Status })}
          className="px-3 py-2 rounded-md border border-border bg-background text-sm"
        >
          {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <input
          type="datetime-local"
          value={toLocal(si.submissions_open_at)}
          onChange={(e) => setSi({ ...si, submissions_open_at: fromLocal(e.target.value) })}
          className="px-3 py-2 rounded-md border border-border bg-background text-sm"
        />
        <input
          type="datetime-local"
          value={toLocal(si.submissions_close_at)}
          onChange={(e) => setSi({ ...si, submissions_close_at: fromLocal(e.target.value) })}
          className="px-3 py-2 rounded-md border border-border bg-background text-sm"
        />
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={() => onSave(si)}
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

export default SpecialIssuesPanel;
