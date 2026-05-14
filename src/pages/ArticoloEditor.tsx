import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Save, Send, Loader2, ArrowUpLeft, Check } from "lucide-react";
import SEO from "@/components/SEO";
import FieldError from "@/components/FieldError";
import MarkdownEditor from "@/components/editor/MarkdownEditor";
import CoverImageUpload from "@/components/editor/CoverImageUpload";
import { articleSchema, fieldErrors, type FieldErrors } from "@/lib/validation";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

type ParentMeta = { id: string; title: string; author_name: string; slug: string };

const ArticoloEditor = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const replyToParam = params.get("reply_to");

  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [errs, setErrs] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState("");
  const [myRoles, setMyRoles] = useState<string[]>([]);
  const [currentStatus, setCurrentStatus] = useState<"draft" | "pending" | "published">("draft");
  const [replyTo, setReplyTo] = useState<string | null>(replyToParam);
  const [parent, setParent] = useState<ParentMeta | null>(null);
  const [editingId, setEditingId] = useState<string | null>(id ?? null);
  const [autoSaveState, setAutoSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const lastSavedRef = useRef<string>("");

  const [form, setForm] = useState({
    title: "",
    category: "",
    excerpt: "",
    content: "",
    coverImageUrl: "",
  });

  const isStaff = useMemo(
    () => myRoles.includes("admin") || myRoles.includes("moderator"),
    [myRoles]
  );

  // Load roles
  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setMyRoles((data ?? []).map((r: { role: string }) => r.role));
      });
  }, [user]);

  // Load existing post (edit mode)
  useEffect(() => {
    if (!isEdit || !id) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        setGlobalError("Articolo non trovato o non accessibile.");
        setLoading(false);
        return;
      }
      setForm({
        title: data.title,
        category: data.category,
        excerpt: data.excerpt,
        content: data.content,
        coverImageUrl: data.cover_image_url ?? "",
      });
      setCurrentStatus(data.status as "draft" | "pending" | "published");
      setReplyTo(data.reply_to_id);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  // Load parent meta if reply
  useEffect(() => {
    if (!replyTo) {
      setParent(null);
      return;
    }
    supabase
      .from("blog_posts")
      .select("id, title, author_name, slug")
      .eq("id", replyTo)
      .maybeSingle()
      .then(({ data }) => setParent((data as ParentMeta | null) ?? null));
  }, [replyTo]);

  // Autosave drafts (debounced 30s) — only for posts not yet published
  useEffect(() => {
    if (!user || loading || submitting) return;
    if (currentStatus === "published") return;
    if (!form.title.trim() || !form.content.trim()) return;

    const snapshot = JSON.stringify(form);
    if (snapshot === lastSavedRef.current) return;

    const timer = setTimeout(async () => {
      setAutoSaveState("saving");
      const authorName = user.email || "Anonimo";

      if (editingId) {
        const { error } = await supabase
          .from("blog_posts")
          .update({
            title: form.title || "Bozza senza titolo",
            category: form.category || "Bozza",
            excerpt: form.excerpt || form.content.slice(0, 200),
            content: form.content,
            cover_image_url: form.coverImageUrl || null,
          })
          .eq("id", editingId);
        if (!error) {
          lastSavedRef.current = snapshot;
          setAutoSaveState("saved");
          setTimeout(() => setAutoSaveState("idle"), 2000);
        } else {
          setAutoSaveState("idle");
        }
      } else {
        // First autosave creates a draft row so subsequent saves update it
        const slug = `${slugify(form.title || "bozza")}-${Math.random().toString(36).slice(2, 8)}`;
        const { data, error } = await supabase
          .from("blog_posts")
          .insert({
            title: form.title || "Bozza senza titolo",
            category: form.category || "Bozza",
            excerpt: form.excerpt || form.content.slice(0, 200),
            content: form.content,
            cover_image_url: form.coverImageUrl || null,
            author_name: authorName,
            user_id: user.id,
            slug,
            status: "draft",
            reply_to_id: replyTo,
          })
          .select("id")
          .maybeSingle();
        if (!error && data) {
          setEditingId(data.id);
          lastSavedRef.current = snapshot;
          setAutoSaveState("saved");
          setTimeout(() => setAutoSaveState("idle"), 2000);
        } else {
          setAutoSaveState("idle");
        }
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [form, user, loading, submitting, currentStatus, editingId, replyTo]);

  if (!user) {
    navigate("/login");
    return null;
  }

  const submit = async (mode: "draft" | "submit") => {
    setErrs({});
    setGlobalError("");

    const parsed = articleSchema(t).safeParse(form);
    if (!parsed.success) {
      setErrs(fieldErrors(parsed.error));
      setGlobalError(t("validation.fixErrors"));
      return;
    }

    setSubmitting(true);

    const targetStatus =
      mode === "draft" ? "draft" : isStaff ? "published" : "pending";

    // Author name from profile
    const { data: prof } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle();
    const authorName = prof?.display_name || user.email || "Anonimo";

    if (editingId) {
      const updates: Record<string, unknown> = {
        title: parsed.data.title,
        category: parsed.data.category,
        excerpt: parsed.data.excerpt,
        content: parsed.data.content,
        cover_image_url: parsed.data.coverImageUrl || null,
        status: targetStatus,
      };
      if (currentStatus !== "published" && targetStatus === "published") {
        updates.published_at = new Date().toISOString();
      }
      const { error } = await supabase.from("blog_posts").update(updates).eq("id", editingId);
      setSubmitting(false);
      if (error) {
        setGlobalError(error.message);
        return;
      }
    } else {
      const slug = `${slugify(parsed.data.title)}-${Math.random().toString(36).slice(2, 8)}`;
      const payload = {
        title: parsed.data.title,
        category: parsed.data.category,
        excerpt: parsed.data.excerpt,
        content: parsed.data.content,
        cover_image_url: parsed.data.coverImageUrl || null,
        author_name: authorName,
        user_id: user.id,
        slug,
        status: targetStatus,
        reply_to_id: replyTo,
        published_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("blog_posts").insert(payload);
      setSubmitting(false);
      if (error) {
        setGlobalError(error.message);
        return;
      }
    }

    navigate("/area-personale");
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-muted-foreground font-body">
        <Loader2 className="inline animate-spin mr-2" size={16} /> Caricamento…
      </div>
    );
  }

  return (
    <div className="py-16">
      <SEO
        title={isEdit ? "Modifica articolo" : "Nuovo articolo"}
        description="Editor articolo Magazine"
        canonicalPath="/area-personale"
      />
      <div className="editorial-container max-w-3xl">
        <Link
          to="/area-personale"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-body mb-6"
        >
          <ArrowLeft size={14} /> Torna all'area personale
        </Link>

        <h1 className="editorial-heading mb-8">
          {isEdit ? "Modifica" : "Nuovo"}{" "}
          <span className="italic text-primary">articolo</span>
        </h1>

        {parent && (
          <div className="mb-6 p-4 rounded-lg bg-secondary/10 border border-secondary/30">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-secondary mb-1">
              <ArrowUpLeft size={14} /> Stai rispondendo a
            </div>
            <Link
              to={`/magazine/${parent.slug}`}
              className="font-display font-semibold hover:text-primary transition-colors"
            >
              {parent.title}
            </Link>
            <p className="text-xs text-muted-foreground font-body mt-1">
              di {parent.author_name}
            </p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit("submit");
          }}
          className="space-y-5"
          noValidate
        >
          {globalError && (
            <div role="alert" className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-body">
              {globalError}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-body font-medium mb-2">Titolo *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={200}
                aria-invalid={!!errs.title}
                className={`w-full px-4 py-3 rounded-md border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errs.title ? "border-destructive" : "border-input"}`}
              />
              <FieldError id="err-title" message={errs.title} />
            </div>
            <div>
              <label className="block text-sm font-body font-medium mb-2">Categoria *</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Es. Tendenze, Inchieste, Intervista"
                maxLength={60}
                aria-invalid={!!errs.category}
                className={`w-full px-4 py-3 rounded-md border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errs.category ? "border-destructive" : "border-input"}`}
              />
              <FieldError id="err-category" message={errs.category} />
            </div>
          </div>

          <CoverImageUpload
            value={form.coverImageUrl}
            onChange={(url) => setForm({ ...form, coverImageUrl: url })}
          />
          <FieldError id="err-coverImageUrl" message={errs.coverImageUrl} />

          <div>
            <label className="block text-sm font-body font-medium mb-2">Estratto *</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={2}
              maxLength={500}
              placeholder="Una breve descrizione che apparirà nelle anteprime."
              aria-invalid={!!errs.excerpt}
              className={`w-full px-4 py-3 rounded-md border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none ${errs.excerpt ? "border-destructive" : "border-input"}`}
            />
            <div className="flex items-center justify-between mt-1">
              <FieldError id="err-excerpt" message={errs.excerpt} />
              <span className={`text-xs font-body ${form.excerpt.length > 450 ? "text-destructive" : "text-muted-foreground"}`}>
                {form.excerpt.length}/500
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-body font-medium mb-2">Contenuto *</label>
            <MarkdownEditor
              value={form.content}
              onChange={(v) => setForm({ ...form, content: v })}
              maxLength={50000}
              invalid={!!errs.content}
            />
            <FieldError id="err-content" message={errs.content} />
          </div>

          <div className="flex items-center gap-3 flex-wrap pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => submit("draft")}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-border font-body font-medium text-sm hover:border-primary/40 transition-colors disabled:opacity-50"
            >
              <Save size={14} /> Salva bozza
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-body font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Send size={14} />
              {isStaff ? "Pubblica" : "Invia per pubblicazione"}
            </button>
            {autoSaveState !== "idle" && (
              <span className="inline-flex items-center gap-1.5 text-xs font-body text-muted-foreground" aria-live="polite">
                {autoSaveState === "saving" ? (
                  <><Loader2 size={12} className="animate-spin" /> Salvataggio bozza…</>
                ) : (
                  <><Check size={12} className="text-secondary" /> Bozza salvata</>
                )}
              </span>
            )}
            {!isStaff && (
              <p className="text-xs text-muted-foreground font-body w-full">
                Il tuo articolo verrà rivisto da un membro dello staff prima della pubblicazione.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticoloEditor;
