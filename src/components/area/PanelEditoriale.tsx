import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Send, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

type Edition = {
  id: string;
  year: number;
  title: string;
  theme_description: string | null;
  status: "draft" | "open_submissions" | "closed_submissions" | "published" | "archived";
  submissions_open_at: string | null;
  submissions_close_at: string | null;
};

type SpecialIssue = {
  id: string;
  edition_id: string;
  title: string;
  theme_description: string | null;
  status: "draft" | "open_submissions" | "closed_submissions" | "published" | "archived";
  submissions_close_at: string | null;
};

type Submission = {
  id: string;
  edition_id: string;
  special_issue_id: string | null;
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
  converted: "Convertita in articolo",
};

const STATUS_COLOR: Record<Submission["status"], string> = {
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  accepted: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  withdrawn: "bg-muted text-muted-foreground border-border",
  converted: "bg-primary/10 text-primary border-primary/30",
};

const PanelEditoriale = ({ userId }: { userId: string }) => {
  const [openEdition, setOpenEdition] = useState<Edition | null>(null);
  const [openIssues, setOpenIssues] = useState<SpecialIssue[]>([]);
  const [target, setTarget] = useState<string>("");
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [abstractText, setAbstractText] = useState("");
  const [outline, setOutline] = useState("");
  const [references, setReferences] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: eds } = await supabase
      .from("editorial_editions")
      .select("*")
      .in("status", ["open_submissions", "closed_submissions", "published"])
      .order("year", { ascending: false });
    const open = ((eds as Edition[]) ?? []).find((e) => e.status === "open_submissions") ?? null;
    setOpenEdition(open);

    const { data: sis } = await supabase
      .from("editorial_special_issues")
      .select("id, edition_id, title, theme_description, status, submissions_close_at")
      .eq("status", "open_submissions");
    const issues = (sis as SpecialIssue[]) ?? [];
    setOpenIssues(issues);
    setTarget((prev) => prev || (open ? `ed:${open.id}` : issues[0] ? `si:${issues[0].id}` : ""));

    const { data: subs } = await supabase
      .from("editorial_submissions")
      .select("*")
      .eq("author_user_id", userId)
      .order("created_at", { ascending: false });
    setMySubmissions((subs as Submission[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const activeIssue = target.startsWith("si:") ? openIssues.find((i) => i.id === target.slice(3)) ?? null : null;
  const hasOpenCall = !!openEdition || openIssues.length > 0;

  const submit = async () => {
    if (!hasOpenCall) return;
    const editionId = activeIssue ? activeIssue.edition_id : openEdition?.id;
    if (!editionId) return toast.error("Nessuna open call selezionata");
    if (!title.trim() || !abstractText.trim()) {
      toast.error("Titolo e abstract sono obbligatori");
      return;
    }
    if (abstractText.length > 800) {
      toast.error("L'abstract non può superare gli 800 caratteri");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("editorial_submissions").insert({
      edition_id: editionId,
      special_issue_id: activeIssue?.id ?? null,
      author_user_id: userId,
      title: title.trim(),
      abstract: abstractText.trim(),
      outline: outline.trim() || null,
      references_text: references.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Candidatura inviata al curatore");
    setTitle("");
    setAbstractText("");
    setOutline("");
    setReferences("");
    load();
  };

  const withdraw = async (id: string) => {
    if (!confirm("Ritirare questa candidatura? Non sarà più visibile al curatore.")) return;
    const { error } = await supabase
      .from("editorial_submissions")
      .update({ status: "withdrawn" })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Candidatura ritirata");
    load();
  };

  return (
    <section className="space-y-8">
      <div className="p-8 rounded-lg bg-card border border-border">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <BookOpen size={20} /> Editoriale — candidature
        </h2>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Proponi un pitch per l'Editoriale annuale o per uno Special Issue aperto: ogni open call ha tema e
          deadline propri. L'editor leggerà l'abstract e ti risponderà con le sue note; se accettato, potrai
          sviluppare l'articolo completo.
        </p>

        {loading ? (
          <p className="text-sm text-muted-foreground mt-6">Caricamento…</p>
        ) : !hasOpenCall ? (
          <div className="mt-6 p-5 rounded-md border border-dashed border-border text-sm text-muted-foreground">
            Al momento non ci sono open call aperte, né per l'Editoriale né per gli Special Issue. Nel frattempo
            puoi proporre un testo per il Bollettino, sempre aperto.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-body">
              <span className="block mb-1 text-muted-foreground">Destinazione del pitch *</span>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
              >
                {openEdition && (
                  <option value={`ed:${openEdition.id}`}>
                    Editoriale {openEdition.year} — {openEdition.title}
                  </option>
                )}
                {openIssues.map((i) => (
                  <option key={i.id} value={`si:${i.id}`}>
                    Special Issue — {i.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="p-4 rounded-md bg-primary/5 border border-primary/20">
              <div className="micro-label text-primary mb-1">
                {activeIssue ? "Special Issue — open call aperta" : "Editoriale — open call aperta"}
              </div>
              <div className="font-display text-lg font-semibold">
                {activeIssue ? activeIssue.title : `${openEdition?.year} — ${openEdition?.title}`}
              </div>
              {(activeIssue ? activeIssue.theme_description : openEdition?.theme_description) && (
                <p className="font-body text-sm text-muted-foreground mt-2">
                  {activeIssue ? activeIssue.theme_description : openEdition?.theme_description}
                </p>
              )}
              {(activeIssue ? activeIssue.submissions_close_at : openEdition?.submissions_close_at) && (
                <p className="text-xs font-mono text-muted-foreground mt-2">
                  Deadline:{" "}
                  {new Date(
                    (activeIssue ? activeIssue.submissions_close_at : openEdition?.submissions_close_at) as string,
                  ).toLocaleString("it-IT", { dateStyle: "long", timeStyle: "short" })}
                </p>
              )}
              <Link
                to="/linee-guida#editoriale"
                className="inline-block mt-3 text-xs font-bold uppercase tracking-[0.15em] text-primary hover:underline"
              >
                Leggi le linee guida →
              </Link>
            </div>

            <label className="block text-sm font-body">
              <span className="block mb-1 text-muted-foreground">Titolo proposto *</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
                maxLength={200}
              />
            </label>

            <label className="block text-sm font-body">
              <span className="flex justify-between mb-1 text-muted-foreground">
                <span>Abstract * (max 800 caratteri)</span>
                <span className="text-xs">{abstractText.length}/800</span>
              </span>
              <textarea
                rows={5}
                value={abstractText}
                onChange={(e) => setAbstractText(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
                maxLength={800}
              />
            </label>

            <label className="block text-sm font-body">
              <span className="block mb-1 text-muted-foreground">Scaletta / outline (opzionale)</span>
              <textarea
                rows={4}
                value={outline}
                onChange={(e) => setOutline(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
              />
            </label>

            <label className="block text-sm font-body">
              <span className="block mb-1 text-muted-foreground">Riferimenti / fonti (opzionale)</span>
              <textarea
                rows={3}
                value={references}
                onChange={(e) => setReferences(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background"
              />
            </label>

            <button
              onClick={submit}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              <Send size={14} /> {submitting ? "Invio…" : "Invia candidatura"}
            </button>
          </div>
        )}
      </div>

      <div className="p-8 rounded-lg bg-card border border-border">
        <h3 className="font-display text-lg font-semibold mb-4">Le mie candidature</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Caricamento…</p>
        ) : mySubmissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Non hai ancora candidature.</p>
        ) : (
          <ul className="space-y-3">
            {mySubmissions.map((s) => (
              <li key={s.id} className="p-4 rounded-md border border-border bg-background/50">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display font-semibold">{s.title}</div>
                    <div className="text-xs font-mono text-muted-foreground mt-1">
                      {new Date(s.created_at).toLocaleDateString("it-IT")}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-mono px-2 py-1 rounded border ${STATUS_COLOR[s.status]}`}
                  >
                    {STATUS_LABEL[s.status]}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{s.abstract}</p>
                {s.curator_notes && (
                  <div className="mt-3 p-3 rounded-md bg-muted/40 border border-border text-sm">
                    <div className="micro-label mb-1">Note del curatore</div>
                    {s.curator_notes}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {s.status === "pending" && (
                    <button
                      onClick={() => withdraw(s.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
                    >
                      <Trash2 size={12} /> Ritira
                    </button>
                  )}
                  {s.status === "accepted" && !s.converted_post_id && (
                    <Link
                      to={`/area-personale/articolo/nuovo?edition=${s.edition_id}${
                        s.special_issue_id ? `&special=${s.special_issue_id}` : ""
                      }&submission=${s.id}&title=${encodeURIComponent(s.title)}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs hover:opacity-90"
                    >
                      <ExternalLink size={12} /> Sviluppa articolo
                    </Link>
                  )}
                  {s.converted_post_id && (
                    <Link
                      to={`/area-personale/articolo/${s.converted_post_id}/modifica`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-muted"
                    >
                      <ExternalLink size={12} /> Apri bozza
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default PanelEditoriale;
