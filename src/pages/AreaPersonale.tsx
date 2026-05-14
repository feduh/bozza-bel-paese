import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  User as UserIcon,
  Plus,
  Edit3,
  Trash2,
  Clock,
  CheckCircle2,
  FileText,
  ShieldCheck,
  ExternalLink,
  MapPin,
  Hourglass,
} from "lucide-react";
import SEO from "@/components/SEO";
import RealityForm from "@/components/RealityForm";

type Profile = {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  website: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  reality_id: string | null;
  affiliation: string | null;
};

type MyPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  status: "draft" | "pending" | "published";
  category: string;
  published_at: string;
  reply_to_id: string | null;
};

type ModerationPost = MyPost & { author_name: string; user_id: string };

type RealityRef = { id: string; name: string };

type MyPendingReality = {
  id: string;
  name: string;
  city: string;
  region: string | null;
  auto_confirm_at: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<MyPost["status"], { label: string; tone: string; icon: typeof Clock }> = {
  draft: { label: "Bozza", tone: "bg-muted text-muted-foreground", icon: FileText },
  pending: { label: "In moderazione", tone: "bg-amber-500/15 text-amber-600 border-amber-500/30", icon: Clock },
  published: { label: "Pubblicato", tone: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", icon: CheckCircle2 },
};

const AreaPersonale = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reality, setReality] = useState<RealityRef | null>(null);
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [myRoles, setMyRoles] = useState<string[]>([]);
  const [moderationQueue, setModerationQueue] = useState<ModerationPost[]>([]);
  const [myPendingRealities, setMyPendingRealities] = useState<MyPendingReality[]>([]);
  const [showNewReality, setShowNewReality] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  const isStaff = myRoles.includes("admin") || myRoles.includes("moderator") || myRoles.includes("collaborator");
  const canProposeRealities = myRoles.includes("admin") || myRoles.includes("collaborator");

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);

    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setProfile(prof as Profile | null);

    if (prof?.reality_id) {
      const { data: r } = await supabase
        .from("realities")
        .select("id, name")
        .eq("id", prof.reality_id)
        .maybeSingle();
      setReality((r as RealityRef | null) ?? null);
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const rs = (roles ?? []).map((r: { role: string }) => r.role);
    setMyRoles(rs);

    const { data: mine } = await supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, status, category, published_at, reply_to_id")
      .eq("user_id", user.id)
      .order("published_at", { ascending: false });
    setPosts((mine as MyPost[]) ?? []);

    if (rs.includes("admin") || rs.includes("moderator") || rs.includes("collaborator")) {
      const { data: queue } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, status, category, published_at, reply_to_id, author_name, user_id")
        .eq("status", "pending")
        .order("published_at", { ascending: true });
      setModerationQueue((queue as ModerationPost[]) ?? []);
    }

    if (rs.includes("admin") || rs.includes("collaborator")) {
      const { data: pending } = await supabase
        .from("realities")
        .select("id, name, city, region, auto_confirm_at, created_at")
        .eq("created_by", user.id)
        .eq("confirmed_status", "pendente")
        .order("created_at", { ascending: false });
      setMyPendingRealities((pending as MyPendingReality[]) ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;
    setSavingProfile(true);
    setProfileMsg("");
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url || null,
        website: profile.website || null,
        social_instagram: profile.social_instagram || null,
        social_twitter: profile.social_twitter || null,
        affiliation: profile.reality_id ? null : (profile.affiliation || null),
      })
      .eq("user_id", user.id);
    setSavingProfile(false);
    setProfileMsg(error ? `Errore: ${error.message}` : "✅ Profilo aggiornato");
  };

  const deletePost = async (id: string) => {
    if (!confirm("Eliminare definitivamente questo articolo?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      alert(`Errore: ${error.message}`);
    } else {
      loadAll();
    }
  };

  const moderateAction = async (id: string, action: "publish" | "reject" | "delete") => {
    if (action === "delete") {
      if (!confirm("Eliminare l'articolo?")) return;
      await supabase.from("blog_posts").delete().eq("id", id);
    } else if (action === "publish") {
      await supabase
        .from("blog_posts")
        .update({ status: "published", published_at: new Date().toISOString() })
        .eq("id", id);
    } else {
      await supabase.from("blog_posts").update({ status: "draft" }).eq("id", id);
    }
    loadAll();
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="py-16">
      <SEO title="Area personale" description="Gestisci il tuo profilo e i tuoi articoli." canonicalPath="/area-personale" />
      <div className="editorial-container max-w-4xl">
        <h1 className="editorial-heading mb-2">
          La <span className="italic text-primary">tua area</span>
        </h1>
        <p className="editorial-body text-muted-foreground mb-12">
          Profilo, articoli e — se sei staff — coda di moderazione.
        </p>

        {loading || !profile ? (
          <div className="text-center py-20 text-muted-foreground font-body">Caricamento…</div>
        ) : (
          <div className="space-y-12">
            {/* Profilo */}
            <section className="p-8 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                  <UserIcon size={20} /> Profilo
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {myRoles.map((r) => (
                    <span
                      key={r}
                      className="inline-flex items-center gap-1 text-xs font-body px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                    >
                      <ShieldCheck size={12} /> {r}
                    </span>
                  ))}
                  {reality && (
                    <span className="text-xs font-body px-2.5 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                      {reality.name}
                    </span>
                  )}
                  {!reality && profile.affiliation && (
                    <span className="text-xs font-body px-2.5 py-1 rounded-full bg-accent/10 text-accent-foreground border border-accent/20">
                      {profile.affiliation}
                    </span>
                  )}
                </div>
              </div>
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Field
                    label="Nome visualizzato"
                    value={profile.display_name}
                    onChange={(v) => setProfile({ ...profile, display_name: v })}
                    required
                  />
                  <Field
                    label="URL avatar"
                    value={profile.avatar_url ?? ""}
                    onChange={(v) => setProfile({ ...profile, avatar_url: v })}
                    placeholder="https://…"
                  />
                </div>
                <div>
                  <label className="block text-sm font-body font-medium mb-2">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
                {!profile.reality_id && (
                  <div>
                    <label className="block text-sm font-body font-medium mb-2">
                      Affiliazione
                      <span className="text-xs font-normal text-muted-foreground ml-2">
                        (es. università, istituzione, indipendente)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={profile.affiliation ?? ""}
                      onChange={(e) => setProfile({ ...profile, affiliation: e.target.value })}
                      placeholder="es. Università di Bologna, MAXXI, ricercatore indipendente…"
                      maxLength={120}
                      className="w-full px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                )}
                <div className="grid md:grid-cols-3 gap-4">
                  <Field label="Sito web" value={profile.website ?? ""} onChange={(v) => setProfile({ ...profile, website: v })} placeholder="https://…" />
                  <Field label="Instagram" value={profile.social_instagram ?? ""} onChange={(v) => setProfile({ ...profile, social_instagram: v })} />
                  <Field label="Twitter / X" value={profile.social_twitter ?? ""} onChange={(v) => setProfile({ ...profile, social_twitter: v })} />
                </div>
                {profileMsg && <p className="text-sm font-body text-muted-foreground">{profileMsg}</p>}
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {savingProfile ? "Salvataggio…" : "Salva profilo"}
                </button>
              </form>
            </section>

            {/* Proponi nuova realtà (collaboratori + admin) */}
            {canProposeRealities && (
              <section className="p-8 rounded-lg bg-card border border-border">
                <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                  <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                    <MapPin size={20} /> Proponi una nuova realtà
                  </h2>
                  <button
                    onClick={() => setShowNewReality((s) => !s)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-body font-medium hover:opacity-90 transition-opacity"
                  >
                    <Plus size={14} /> {showNewReality ? "Chiudi form" : "Nuova realtà"}
                  </button>
                </div>
                {showNewReality && (
                  <RealityForm
                    mode={myRoles.includes("admin") ? "admin" : "collaborator"}
                    onCreated={() => { setShowNewReality(false); loadAll(); }}
                  />
                )}

                {myPendingRealities.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
                      <Hourglass size={14} className="text-amber-600" /> Le tue proposte in verifica
                    </h3>
                    <div className="space-y-2">
                      {myPendingRealities.map((r) => {
                        const ms = r.auto_confirm_at ? new Date(r.auto_confirm_at).getTime() - Date.now() : 0;
                        const hours = Math.max(0, Math.floor(ms / 3600000));
                        const mins = Math.max(0, Math.floor((ms % 3600000) / 60000));
                        const ready = ms <= 0;
                        return (
                          <div key={r.id} className="p-3 rounded-md border border-amber-500/30 bg-amber-500/5 flex items-center justify-between gap-3 flex-wrap">
                            <div className="min-w-0">
                              <p className="font-body font-medium text-sm">{r.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {r.city}{r.region ? ` · ${r.region}` : ""} ·{" "}
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
            )}


            {isStaff && (
              <section className="p-8 rounded-lg bg-card border border-amber-500/30">
                <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
                  <Clock size={20} className="text-amber-600" /> Coda di moderazione
                  <span className="text-base font-body text-muted-foreground">
                    ({moderationQueue.length})
                  </span>
                </h2>
                {moderationQueue.length === 0 ? (
                  <p className="text-sm text-muted-foreground font-body italic">
                    Nessun articolo in attesa di moderazione.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {moderationQueue.map((p) => (
                      <div key={p.id} className="p-4 rounded-md border border-border bg-background">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-semibold mb-1">{p.title}</p>
                            <p className="text-xs text-muted-foreground font-body mb-1">
                              di {p.author_name} · {p.category}
                              {p.reply_to_id && " · risposta"}
                            </p>
                            <p className="text-sm font-body text-muted-foreground line-clamp-2">
                              {p.excerpt}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              to={`/area-personale/articolo/${p.id}/modifica`}
                              className="text-xs font-body px-3 py-1.5 rounded-md border border-border hover:border-primary/40 transition-colors"
                            >
                              Apri
                            </Link>
                            <button
                              onClick={() => moderateAction(p.id, "publish")}
                              className="text-xs font-body px-3 py-1.5 rounded-md bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
                            >
                              Pubblica
                            </button>
                            <button
                              onClick={() => moderateAction(p.id, "reject")}
                              className="text-xs font-body px-3 py-1.5 rounded-md border border-border hover:border-amber-500/40 transition-colors"
                            >
                              Rimanda in bozza
                            </button>
                            <button
                              onClick={() => moderateAction(p.id, "delete")}
                              className="text-xs font-body px-3 py-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* I miei articoli */}
            <section className="p-8 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                  <FileText size={20} /> I miei articoli
                </h2>
                <Link
                  to="/area-personale/articolo/nuovo"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-body font-medium hover:opacity-90 transition-opacity"
                >
                  <Plus size={14} /> Nuovo articolo
                </Link>
              </div>
              {posts.length === 0 ? (
                <p className="text-sm text-muted-foreground font-body italic">
                  Non hai ancora scritto articoli.
                </p>
              ) : (
                <div className="space-y-3">
                  {posts.map((p) => {
                    const s = STATUS_LABEL[p.status];
                    const Icon = s.icon;
                    const canEdit = p.status !== "published" || isStaff;
                    return (
                      <div key={p.id} className="p-4 rounded-md border border-border bg-background">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full border ${s.tone}`}
                              >
                                <Icon size={10} /> {s.label}
                              </span>
                              <span className="text-xs font-body text-muted-foreground">
                                {p.category}
                              </span>
                              {p.reply_to_id && (
                                <span className="text-[10px] uppercase tracking-widest font-bold text-secondary">
                                  · risposta
                                </span>
                              )}
                            </div>
                            <p className="font-display font-semibold">{p.title}</p>
                            <p className="text-sm font-body text-muted-foreground line-clamp-1 mt-1">
                              {p.excerpt}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {p.status === "published" && (
                              <Link
                                to={`/magazine/${p.slug}`}
                                className="p-2 rounded-md border border-border hover:border-primary/40 transition-colors"
                                title="Vedi pubblicato"
                              >
                                <ExternalLink size={14} />
                              </Link>
                            )}
                            {canEdit && (
                              <Link
                                to={`/area-personale/articolo/${p.id}/modifica`}
                                className="p-2 rounded-md border border-border hover:border-primary/40 transition-colors"
                                title="Modifica"
                              >
                                <Edit3 size={14} />
                              </Link>
                            )}
                            {(p.status !== "published" || isStaff) && (
                              <button
                                onClick={() => deletePost(p.id)}
                                className="p-2 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                                title="Elimina"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {myRoles.includes("admin") && (
              <section className="p-6 rounded-lg bg-card border border-border">
                <p className="font-body text-sm text-muted-foreground mb-3">
                  Strumenti amministrativi (gestione utenti e realtà):
                </p>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-body font-medium hover:opacity-90 transition-opacity"
                >
                  <ShieldCheck size={14} /> Pannello Admin
                </Link>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) => (
  <div>
    <label className="block text-sm font-body font-medium mb-2">
      {label} {required && "*"}
    </label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder={placeholder}
      maxLength={255}
      className="w-full px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    />
  </div>
);

export default AreaPersonale;
