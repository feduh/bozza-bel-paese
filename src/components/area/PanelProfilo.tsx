import { supabase } from "@/integrations/supabase/client";
import { User as UserIcon, ShieldCheck } from "lucide-react";
import { FIGURE_CATEGORIES } from "@/lib/categories";
import type { AreaProfile, AreaRealityRef } from "./types";

type Props = {
  profile: AreaProfile;
  setProfile: (p: AreaProfile) => void;
  reality: AreaRealityRef | null;
  myRoles: string[];
  userId: string;
  saving: boolean;
  setSaving: (v: boolean) => void;
  msg: string;
  setMsg: (v: string) => void;
};

const PanelProfilo = ({ profile, setProfile, reality, myRoles, userId, saving, setSaving, msg, setMsg }: Props) => {
  const isStaff = myRoles.includes("admin") || myRoles.includes("moderator") || myRoles.includes("coordinatore");

  const handleAvatarUpload = async (file: File) => {
    setSaving(true);
    setMsg("");
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) {
      setMsg(`Errore upload: ${upErr.message}`);
      setSaving(false);
      return;
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    setProfile({ ...profile, avatar_url: pub.publicUrl });
    setSaving(false);
    setMsg("✅ Foto caricata. Ricorda di salvare il profilo.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url || null,
        website: profile.website || null,
        social_instagram: profile.social_instagram || null,
        social_twitter: profile.social_twitter || null,
        social_linkedin: profile.social_linkedin || null,
        affiliation: profile.reality_id ? null : (profile.affiliation || null),
        public_email: profile.public_email || null,
        consent_public: !!profile.consent_public,
        member_type: isStaff ? (profile.member_type || null) : "autore",
        role_collective: isStaff ? (profile.role_collective || null) : null,
        role_real_life: profile.role_real_life || null,
        figure_category: profile.figure_category || null,
      })
      .eq("user_id", userId);
    setSaving(false);
    setMsg(error ? `Errore: ${error.message}` : "✅ Profilo aggiornato");
  };

  return (
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
      <form onSubmit={handleSave} className="space-y-4">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover bg-muted border border-border" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-2xl border border-border">
              {(profile.display_name || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background text-sm font-body cursor-pointer hover:border-primary/40 transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleAvatarUpload(f);
                }}
              />
              Carica foto
            </label>
            <p className="text-xs text-muted-foreground font-body mt-1">JPG/PNG, max ~2MB consigliato</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Field
            label="Nome visualizzato"
            value={profile.display_name}
            onChange={(v) => setProfile({ ...profile, display_name: v })}
            required
          />
          {isStaff && (
            <Field
              label="Ruolo dentro il collettivo"
              value={profile.role_collective ?? ""}
              onChange={(v) => setProfile({ ...profile, role_collective: v })}
              placeholder="es. coordinamento editoriale"
            />
          )}
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

        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Ruolo Lavorativo" value={profile.role_real_life ?? ""} onChange={(v) => setProfile({ ...profile, role_real_life: v })} placeholder="es. curatrice indipendente" />
          <div>
            <label className="block text-sm font-body font-medium mb-2">Categoria figura</label>
            <select
              value={profile.figure_category ?? ""}
              onChange={(e) => setProfile({ ...profile, figure_category: e.target.value })}
              className="w-full px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">— non specificata —</option>
              {FIGURE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {!profile.reality_id && (
          <div className="grid md:grid-cols-2 gap-4">
            <Field
              label="Affiliazione"
              value={profile.affiliation ?? ""}
              onChange={(v) => setProfile({ ...profile, affiliation: v })}
              placeholder="es. Università di Bologna, MAXXI…"
            />
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Email pubblica" value={profile.public_email ?? ""} onChange={(v) => setProfile({ ...profile, public_email: v })} placeholder="visibile sul profilo pubblico" />
          <Field label="Sito web" value={profile.website ?? ""} onChange={(v) => setProfile({ ...profile, website: v })} placeholder="https://…" />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Instagram" value={profile.social_instagram ?? ""} onChange={(v) => setProfile({ ...profile, social_instagram: v })} />
          <Field label="LinkedIn" value={profile.social_linkedin ?? ""} onChange={(v) => setProfile({ ...profile, social_linkedin: v })} placeholder="https://linkedin.com/in/…" />
          <Field label="Twitter / X" value={profile.social_twitter ?? ""} onChange={(v) => setProfile({ ...profile, social_twitter: v })} />
        </div>

        <label className="flex items-start gap-3 p-4 rounded-md border border-border bg-muted/30 cursor-pointer">
          <input
            type="checkbox"
            checked={!!profile.consent_public}
            onChange={(e) => setProfile({ ...profile, consent_public: e.target.checked })}
            className="mt-1"
          />
          <span className="text-sm font-body">
            <strong>Acconsento alla pubblicazione del mio profilo</strong> nella pagina pubblica della rete /
            chi siamo. I dati condivisi (nome, foto, bio, ruoli, email pubblica, social) saranno visibili a
            chiunque visiti il sito, per favorire connessioni e collaborazioni.
          </span>
        </label>
        {msg && <p className="text-sm font-body text-muted-foreground">{msg}</p>}
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Salvataggio…" : "Salva profilo"}
        </button>
      </form>
    </section>
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

export default PanelProfilo;
